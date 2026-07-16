from __future__ import annotations

import uuid
from decimal import Decimal

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone
from django.utils.text import slugify


class ResourceCategory(models.TextChoices):
    ROOM = "room", "Room"
    MEETING = "meeting", "Meeting Space"
    CLINIC = "clinic", "Clinic"
    SALON = "salon", "Salon"
    VEHICLE = "vehicle", "Vehicle"
    TABLE = "table", "Table"
    VENUE = "venue", "Venue"
    OTHER = "other", "Other"


class PricingMode(models.TextChoices):
    FIXED = "fixed", "Fixed"
    HOURLY = "hourly", "Hourly"
    DAILY = "daily", "Daily"


class DurationMode(models.TextChoices):
    FLEXIBLE = "flexible", "Flexible"
    FIXED_SLOT = "fixed_slot", "Fixed Slot"


class ResourceStatus(models.TextChoices):
    DRAFT = "draft", "Draft"
    PUBLISHED = "published", "Published"
    ARCHIVED = "archived", "Archived"


class Resource(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    short_description = models.CharField(max_length=280)
    full_description = models.TextField()
    category = models.CharField(max_length=32, choices=ResourceCategory.choices, default=ResourceCategory.OTHER)
    capacity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    currency = models.CharField(max_length=3, default=settings.BOOKING_DEFAULT_CURRENCY)
    price_mode = models.CharField(max_length=20, choices=PricingMode.choices, default=PricingMode.FIXED)
    duration_mode = models.CharField(max_length=20, choices=DurationMode.choices, default=DurationMode.FLEXIBLE)
    min_booking_duration = models.PositiveIntegerField(help_text="Duration in minutes.", default=60)
    max_booking_duration = models.PositiveIntegerField(help_text="Duration in minutes.", default=480)
    status = models.CharField(max_length=20, choices=ResourceStatus.choices, default=ResourceStatus.DRAFT)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="created_resources")
    primary_staff = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, related_name="assigned_resources", null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now, editable=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("name",)
        indexes = [models.Index(fields=("category", "status", "is_active"))]

    def __str__(self) -> str:
        return self.name

    def clean(self):
        if self.max_booking_duration < self.min_booking_duration:
            raise ValidationError({"max_booking_duration": "Maximum duration must be greater than or equal to minimum duration."})
        if self.primary_staff and not self.primary_staff.is_staff_role and not self.primary_staff.is_admin:
            raise ValidationError({"primary_staff": "Primary staff must have the staff role."})

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class ResourceImage(models.Model):
    id = models.BigAutoField(primary_key=True)
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name="images")
    image_url = models.URLField()
    alt_text = models.CharField(max_length=255)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("sort_order", "id")


class AvailabilityRule(models.Model):
    id = models.BigAutoField(primary_key=True)
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name="availability_rules")
    day_of_week = models.PositiveSmallIntegerField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("day_of_week", "start_time")

    def clean(self):
        if self.day_of_week > 6:
            raise ValidationError({"day_of_week": "Day of week must be between 0 and 6."})
        if self.end_time <= self.start_time:
            raise ValidationError({"end_time": "End time must be after start time."})


class BlackoutPeriod(models.Model):
    id = models.BigAutoField(primary_key=True)
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name="blackout_periods")
    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField()
    reason = models.CharField(max_length=255)

    class Meta:
        ordering = ("start_datetime",)

    def clean(self):
        if self.end_datetime <= self.start_datetime:
            raise ValidationError({"end_datetime": "End datetime must be after start datetime."})
