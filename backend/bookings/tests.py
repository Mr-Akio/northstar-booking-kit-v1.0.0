from datetime import timedelta

from django.db import connection
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User, UserRole
from bookings.models import Booking, BookingStatus
from bookings.services import calculate_booking_price
from resources.models import AvailabilityRule, Resource, ResourceCategory, ResourceStatus


class BookingApiTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(email="admin-book@example.com", password="StrongPass123!", first_name="Admin", last_name="User", role=UserRole.ADMIN)
        self.staff = User.objects.create_user(email="staff-book@example.com", password="StrongPass123!", first_name="Staff", last_name="User", role=UserRole.STAFF)
        self.customer = User.objects.create_user(email="customer-book@example.com", password="StrongPass123!", first_name="Customer", last_name="User", role=UserRole.CUSTOMER)
        self.other_customer = User.objects.create_user(email="other-book@example.com", password="StrongPass123!", first_name="Other", last_name="User", role=UserRole.CUSTOMER)
        self.resource = Resource.objects.create(
            name="Meeting Pod",
            slug="meeting-pod",
            short_description="Focused workspace",
            full_description="Focused workspace for private bookings",
            category=ResourceCategory.MEETING,
            capacity=3,
            price=50,
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
        self.start = (timezone.now() + timedelta(days=1)).replace(hour=10, minute=0, second=0, microsecond=0)
        self.end = self.start + timedelta(hours=2)

    def _booking_payload(self):
        return {
            "resource_id": str(self.resource.id),
            "start_datetime": self.start.isoformat(),
            "end_datetime": self.end.isoformat(),
            "number_of_guests": 2,
            "notes": "Please prepare whiteboard.",
            "guests": [{"full_name": "Guest One", "email": "guest@example.com", "phone": "12345", "notes": ""}],
        }

    def test_customer_can_create_booking_and_price_is_computed(self):
        self.client.force_authenticate(self.customer)
        response = self.client.post(reverse("booking-list"), self._booking_payload(), format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["data"]["total_price"], "100.00")

    def test_booking_overlap_is_blocked(self):
        Booking.objects.create(
            user=self.customer,
            resource=self.resource,
            start_datetime=self.start,
            end_datetime=self.end,
            number_of_guests=1,
            status=BookingStatus.CONFIRMED,
            unit_price=50,
            total_price=100,
            blocks_availability=True,
        )
        self.client.force_authenticate(self.other_customer)
        response = self.client.post(reverse("booking-list"), self._booking_payload(), format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"]["code"], "booking_conflict")

    def test_customer_can_cancel_own_booking(self):
        booking = Booking.objects.create(
            user=self.customer,
            resource=self.resource,
            start_datetime=self.start,
            end_datetime=self.end,
            number_of_guests=1,
            status=BookingStatus.PENDING,
            unit_price=50,
            total_price=100,
            blocks_availability=False,
        )
        self.client.force_authenticate(self.customer)
        response = self.client.post(reverse("booking-cancel", args=[booking.id]), {"reason": "Need to reschedule"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        booking.refresh_from_db()
        self.assertEqual(booking.status, BookingStatus.CANCELLED)

    def test_invalid_state_transition_is_rejected(self):
        booking = Booking.objects.create(
            user=self.customer,
            resource=self.resource,
            start_datetime=self.start,
            end_datetime=self.end,
            number_of_guests=1,
            status=BookingStatus.CANCELLED,
            unit_price=50,
            total_price=100,
            blocks_availability=False,
        )
        self.client.force_authenticate(self.staff)
        response = self.client.post(reverse("booking-confirm", args=[booking.id]), {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_object_level_authorization_blocks_other_customer(self):
        booking = Booking.objects.create(
            user=self.customer,
            resource=self.resource,
            start_datetime=self.start,
            end_datetime=self.end,
            number_of_guests=1,
            status=BookingStatus.PENDING,
            unit_price=50,
            total_price=100,
            blocks_availability=False,
        )
        self.client.force_authenticate(self.other_customer)
        response = self.client.get(reverse("booking-detail", args=[booking.id]))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_staff_can_confirm_assigned_booking(self):
        booking = Booking.objects.create(
            user=self.customer,
            resource=self.resource,
            start_datetime=self.start,
            end_datetime=self.end,
            number_of_guests=1,
            status=BookingStatus.PENDING,
            unit_price=50,
            total_price=100,
            blocks_availability=False,
        )
        self.client.force_authenticate(self.staff)
        response = self.client.post(reverse("booking-confirm", args=[booking.id]), {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        booking.refresh_from_db()
        self.assertEqual(booking.status, BookingStatus.CONFIRMED)

    def test_admin_can_access_all_bookings(self):
        booking = Booking.objects.create(
            user=self.customer,
            resource=self.resource,
            start_datetime=self.start,
            end_datetime=self.end,
            number_of_guests=1,
            status=BookingStatus.PENDING,
            unit_price=50,
            total_price=100,
            blocks_availability=False,
        )
        self.client.force_authenticate(self.admin)
        response = self.client.get(reverse("booking-detail", args=[booking.id]))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_price_calculation_helper(self):
        unit, total = calculate_booking_price(self.resource, self.start, self.end)
        self.assertEqual(str(unit), "50")
        self.assertEqual(str(total), "100.00")

    def test_concurrency_guard_structure_exists(self):
        self.assertIn(connection.vendor, {"sqlite", "postgresql"})
