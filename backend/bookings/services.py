from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal, ROUND_HALF_UP

from django.conf import settings
from django.db import connection, transaction
from django.utils import timezone
from rest_framework import serializers

from bookings.models import Booking, BookingGuest, BookingStatus
from resources.models import PricingMode, Resource


@dataclass(frozen=True)
class BookingTransition:
    from_status: str
    to_status: str


ALLOWED_TRANSITIONS = {
    BookingTransition(BookingStatus.PENDING, BookingStatus.CONFIRMED),
    BookingTransition(BookingStatus.PENDING, BookingStatus.CANCELLED),
    BookingTransition(BookingStatus.PENDING, BookingStatus.REJECTED),
    BookingTransition(BookingStatus.CONFIRMED, BookingStatus.CANCELLED),
    BookingTransition(BookingStatus.CONFIRMED, BookingStatus.COMPLETED),
}


def status_blocks_availability(status: str) -> bool:
    if status == BookingStatus.CONFIRMED:
        return True
    if status == BookingStatus.COMPLETED:
        return True
    if status == BookingStatus.PENDING:
        return settings.BOOKING_PENDING_LOCKS_SLOT
    return False


def calculate_booking_price(resource: Resource, start_datetime, end_datetime) -> tuple[Decimal, Decimal]:
    duration = end_datetime - start_datetime
    if resource.price_mode == PricingMode.FIXED:
        unit_price = resource.price
        total = resource.price
    elif resource.price_mode == PricingMode.HOURLY:
        hours = Decimal(duration.total_seconds()) / Decimal(3600)
        unit_price = resource.price
        total = (resource.price * hours).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    else:
        days = Decimal(duration.total_seconds()) / Decimal(86400)
        unit_price = resource.price
        total = (resource.price * days).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    return unit_price, total


def validate_booking_window(resource: Resource, start_datetime, end_datetime, guest_count: int) -> None:
    if start_datetime >= end_datetime:
        raise serializers.ValidationError({"end_datetime": ["End datetime must be after start datetime."]})
    if start_datetime <= timezone.now():
        raise serializers.ValidationError({"start_datetime": ["Bookings must be created in the future."]})
    if not resource.is_active or resource.status != "published":
        raise serializers.ValidationError({"resource": ["This resource is not available for booking."]})
    if guest_count > resource.capacity:
        raise serializers.ValidationError({"number_of_guests": ["Guest count exceeds resource capacity."]})

    duration_minutes = int((end_datetime - start_datetime).total_seconds() / 60)
    if duration_minutes < resource.min_booking_duration:
        raise serializers.ValidationError({"start_datetime": ["Booking duration is shorter than the minimum allowed."]})
    if duration_minutes > resource.max_booking_duration:
        raise serializers.ValidationError({"end_datetime": ["Booking duration is longer than the maximum allowed."]})

    weekday = start_datetime.weekday()
    matching_rule = resource.availability_rules.filter(day_of_week=weekday, is_active=True, start_time__lte=start_datetime.time(), end_time__gte=end_datetime.time()).exists()
    if not matching_rule:
        raise serializers.ValidationError({"start_datetime": ["The selected time falls outside resource availability."]})

    blackout_conflict = resource.blackout_periods.filter(start_datetime__lt=end_datetime, end_datetime__gt=start_datetime).exists()
    if blackout_conflict:
        raise serializers.ValidationError({"start_datetime": ["The selected time overlaps a blackout period."]})


def overlapping_bookings(resource: Resource, start_datetime, end_datetime):
    return Booking.objects.filter(resource=resource, blocks_availability=True, start_datetime__lt=end_datetime, end_datetime__gt=start_datetime)


@transaction.atomic
def create_booking(*, user, resource: Resource, start_datetime, end_datetime, number_of_guests: int, notes: str = "", guests: list[dict] | None = None) -> Booking:
    locked_resource = Resource.objects.select_for_update().get(pk=resource.pk)
    validate_booking_window(locked_resource, start_datetime, end_datetime, number_of_guests)

    if overlapping_bookings(locked_resource, start_datetime, end_datetime).select_for_update().exists():
        raise serializers.ValidationError({"non_field_errors": ["This time slot is no longer available."]}, code="booking_conflict")

    unit_price, total_price = calculate_booking_price(locked_resource, start_datetime, end_datetime)
    booking = Booking.objects.create(
        user=user,
        resource=locked_resource,
        start_datetime=start_datetime,
        end_datetime=end_datetime,
        number_of_guests=number_of_guests,
        notes=notes,
        unit_price=unit_price,
        total_price=total_price,
        blocks_availability=status_blocks_availability(BookingStatus.PENDING),
    )
    for guest in guests or []:
        BookingGuest.objects.create(booking=booking, **guest)
    return booking


@transaction.atomic
def transition_booking(*, booking: Booking, actor, target_status: str, reason: str = "") -> Booking:
    # Avoid locking through the nullable primary_staff relation because PostgreSQL
    # rejects FOR UPDATE on the nullable side of an outer join.
    booking = Booking.objects.select_for_update().select_related("resource", "user").get(pk=booking.pk)
    if BookingTransition(booking.status, target_status) not in ALLOWED_TRANSITIONS:
        raise serializers.ValidationError({"status": ["This booking status transition is not allowed."]}, code="invalid_transition")

    if target_status == BookingStatus.CONFIRMED and overlapping_bookings(booking.resource, booking.start_datetime, booking.end_datetime).exclude(pk=booking.pk).select_for_update().exists():
        raise serializers.ValidationError({"non_field_errors": ["This time slot is no longer available."]}, code="booking_conflict")

    booking.status = target_status
    booking.blocks_availability = status_blocks_availability(target_status)
    if target_status == BookingStatus.CANCELLED:
        booking.cancelled_at = timezone.now()
        booking.cancellation_reason = reason
    elif target_status == BookingStatus.REJECTED:
        booking.cancellation_reason = reason
        booking.blocks_availability = False
    booking.save()
    return booking


def database_supports_exclusion_constraints() -> bool:
    return connection.vendor == "postgresql"
