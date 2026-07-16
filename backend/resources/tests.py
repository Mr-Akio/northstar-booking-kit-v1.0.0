from datetime import timedelta

from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User, UserRole
from resources.models import AvailabilityRule, Resource, ResourceCategory, ResourceStatus


class ResourceApiTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(email="admin@example.com", password="StrongPass123!", first_name="Admin", last_name="User", role=UserRole.ADMIN)
        self.staff = User.objects.create_user(email="staff@example.com", password="StrongPass123!", first_name="Staff", last_name="User", role=UserRole.STAFF)
        self.other_staff = User.objects.create_user(email="other@example.com", password="StrongPass123!", first_name="Other", last_name="Staff", role=UserRole.STAFF)
        self.resource = Resource.objects.create(
            name="Room A",
            slug="room-a",
            short_description="Quiet room",
            full_description="Quiet room for team use",
            category=ResourceCategory.ROOM,
            capacity=4,
            price=120,
            currency="USD",
            price_mode="hourly",
            duration_mode="flexible",
            min_booking_duration=60,
            max_booking_duration=240,
            status=ResourceStatus.PUBLISHED,
            is_active=True,
            created_by=self.admin,
            primary_staff=self.staff,
        )
        weekday = (timezone.now() + timedelta(days=1)).weekday()
        AvailabilityRule.objects.create(resource=self.resource, day_of_week=weekday, start_time=timezone.datetime(2026, 1, 1, 9, 0).time(), end_time=timezone.datetime(2026, 1, 1, 17, 0).time(), is_active=True)

    def test_public_can_list_published_resources(self):
        response = self.client.get(reverse("resource-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["pagination"]["count"], 1)

    def test_staff_can_create_resource(self):
        self.client.force_authenticate(self.staff)
        payload = {
            "name": "Consult Room",
            "slug": "consult-room",
            "short_description": "Small consult room",
            "full_description": "Purpose-built consult room",
            "category": "clinic",
            "capacity": 2,
            "price": "80.00",
            "currency": "USD",
            "price_mode": "hourly",
            "duration_mode": "flexible",
            "min_booking_duration": 60,
            "max_booking_duration": 180,
            "status": "published",
            "is_active": True,
            "primary_staff": str(self.staff.id),
            "images": [],
            "availability_rules": [],
            "blackout_periods": [],
        }
        response = self.client.post(reverse("resource-list"), payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_staff_cannot_update_unassigned_resource(self):
        self.client.force_authenticate(self.other_staff)
        response = self.client.patch(reverse("resource-detail", args=[self.resource.id]), {"short_description": "Changed"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_availability_endpoint_returns_windows(self):
        target_date = (timezone.now() + timedelta(days=1)).date().isoformat()
        response = self.client.get(reverse("resource-availability", args=[self.resource.id]), {"start_date": target_date, "end_date": target_date})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"][0]["date"], target_date)
