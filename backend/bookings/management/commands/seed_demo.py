from __future__ import annotations

from datetime import time, timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from accounts.models import User, UserRole
from bookings.models import Booking, BookingStatus
from bookings.services import calculate_booking_price, status_blocks_availability
from resources.models import AvailabilityRule, BlackoutPeriod, PricingMode, Resource, ResourceCategory, ResourceStatus


class Command(BaseCommand):
    help = "Seed reusable demo data for Northstar Booking Kit."

    def handle(self, *args, **options):
        admin, _ = User.objects.update_or_create(
            email="admin@northstar.local",
            defaults={
                "first_name": "Avery",
                "last_name": "Admin",
                "role": UserRole.ADMIN,
                "is_active": True,
                "is_verified": True,
                "is_superuser": True,
            },
        )
        admin.set_password("DemoPass123!")
        admin.save()

        staff, _ = User.objects.update_or_create(
            email="staff@northstar.local",
            defaults={"first_name": "Jordan", "last_name": "Staff", "role": UserRole.STAFF, "is_active": True, "is_verified": True},
        )
        staff.set_password("DemoPass123!")
        staff.save()

        customer, _ = User.objects.update_or_create(
            email="customer@northstar.local",
            defaults={"first_name": "Taylor", "last_name": "Customer", "role": UserRole.CUSTOMER, "is_active": True, "is_verified": True},
        )
        customer.set_password("DemoPass123!")
        customer.save()

        resource_specs = [
            ("Riverside Room", ResourceCategory.ROOM, PricingMode.DAILY, 180),
            ("North Wing Meeting Suite", ResourceCategory.MEETING, PricingMode.HOURLY, 45),
            ("Studio Chair A", ResourceCategory.SALON, PricingMode.HOURLY, 25),
            ("Consultation Desk 2", ResourceCategory.CLINIC, PricingMode.HOURLY, 60),
            ("Executive Sedan", ResourceCategory.VEHICLE, PricingMode.DAILY, 120),
            ("Garden Event Zone", ResourceCategory.VENUE, PricingMode.FIXED, 900),
        ]

        created_resources = []
        for index, (name, category, price_mode, price) in enumerate(resource_specs, start=1):
            resource, _ = Resource.objects.update_or_create(
                slug=name.lower().replace(" ", "-"),
                defaults={
                    "name": name,
                    "short_description": f"Reusable demo resource {index}",
                    "full_description": f"Production-style demo resource {index} for the Northstar Booking Kit.",
                    "category": category,
                    "capacity": 2 + index,
                    "price": price,
                    "currency": "USD",
                    "price_mode": price_mode,
                    "duration_mode": "flexible",
                    "min_booking_duration": 60,
                    "max_booking_duration": 480 if price_mode != PricingMode.DAILY else 2880,
                    "status": ResourceStatus.PUBLISHED,
                    "is_active": True,
                    "created_by": admin,
                    "primary_staff": staff,
                },
            )
            created_resources.append(resource)
            for weekday in range(0, 5):
                AvailabilityRule.objects.update_or_create(
                    resource=resource,
                    day_of_week=weekday,
                    start_time=time(9, 0),
                    defaults={"end_time": time(18, 0), "is_active": True},
                )

        start_of_next_week = timezone.now() + timedelta(days=(7 - timezone.now().weekday()))
        BlackoutPeriod.objects.update_or_create(
            resource=created_resources[0],
            start_datetime=start_of_next_week.replace(hour=12, minute=0, second=0, microsecond=0),
            defaults={
                "end_datetime": start_of_next_week.replace(hour=14, minute=0, second=0, microsecond=0),
                "reason": "Routine maintenance",
            },
        )

        statuses = [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.CANCELLED, BookingStatus.COMPLETED, BookingStatus.REJECTED]
        for idx, booking_status in enumerate(statuses):
            resource = created_resources[idx % len(created_resources)]
            slot_start = (timezone.now() + timedelta(days=idx + 2)).replace(hour=10, minute=0, second=0, microsecond=0)
            slot_end = slot_start + timedelta(hours=2)
            unit_price, total_price = calculate_booking_price(resource, slot_start, slot_end)
            Booking.objects.update_or_create(
                booking_reference=f"DEMO-{idx + 1:03d}",
                defaults={
                    "user": customer,
                    "resource": resource,
                    "start_datetime": slot_start,
                    "end_datetime": slot_end,
                    "number_of_guests": 2,
                    "status": booking_status,
                    "unit_price": unit_price,
                    "total_price": total_price,
                    "notes": "Seeded demo booking",
                    "blocks_availability": status_blocks_availability(booking_status),
                    "cancellation_reason": "Seeded cancellation" if booking_status in {BookingStatus.CANCELLED, BookingStatus.REJECTED} else "",
                    "cancelled_at": timezone.now() if booking_status == BookingStatus.CANCELLED else None,
                },
            )

        self.stdout.write(self.style.SUCCESS("Seeded demo users, resources, availability, and bookings."))
