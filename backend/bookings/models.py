from __future__ import annotations

import uuid
from decimal import Decimal

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone


class BookingStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    CONFIRMED = "confirmed", "Confirmed"
    CANCELLED = "cancelled", "Cancelled"
    COMPLETED = "completed", "Completed"
    REJECTED = "rejected", "Rejected"


class Booking(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    booking_reference = models.CharField(max_length=32, unique=True, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="bookings")
    resource = models.ForeignKey("resources.Resource", on_delete=models.PROTECT, related_name="bookings")
    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField()
    number_of_guests = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=20, choices=BookingStatus.choices, default=BookingStatus.PENDING)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    notes = models.TextField(blank=True)
    cancellation_reason = models.TextField(blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    blocks_availability = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now, editable=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at",)
        indexes = [
            models.Index(fields=("resource", "status")),
            models.Index(fields=("start_datetime", "end_datetime")),
            models.Index(fields=("blocks_availability",)),
        ]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(end_datetime__gt=models.F("start_datetime")),
                name="booking_end_after_start",
            )
        ]

    def __str__(self) -> str:
        return self.booking_reference

    def clean(self):
        if self.end_datetime <= self.start_datetime:
            raise ValidationError({"end_datetime": "End datetime must be after start datetime."})

    def save(self, *args, **kwargs):
        if not self.booking_reference:
            self.booking_reference = f"NBK-{timezone.now():%Y%m%d}-{str(uuid.uuid4())[:8].upper()}"
        super().save(*args, **kwargs)


class BookingGuest(models.Model):
    id = models.BigAutoField(primary_key=True)
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name="guests")
    full_name = models.CharField(max_length=255)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ("id",)
