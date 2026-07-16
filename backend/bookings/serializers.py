from __future__ import annotations

from rest_framework import serializers

from accounts.serializers import UserSerializer
from bookings.models import Booking, BookingGuest
from bookings.services import create_booking
from resources.models import Resource
from resources.serializers import ResourceSerializer


class BookingGuestSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookingGuest
        fields = ("id", "full_name", "email", "phone", "notes")
        read_only_fields = ("id",)


class BookingSerializer(serializers.ModelSerializer):
    guests = BookingGuestSerializer(many=True, required=False)
    resource = ResourceSerializer(read_only=True)
    resource_id = serializers.PrimaryKeyRelatedField(source="resource", queryset=Resource.objects.all(), write_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = Booking
        fields = (
            "id", "booking_reference", "user", "resource", "resource_id", "start_datetime", "end_datetime",
            "number_of_guests", "status", "unit_price", "total_price", "notes", "cancellation_reason",
            "cancelled_at", "guests", "created_at", "updated_at",
        )
        read_only_fields = (
            "id", "booking_reference", "user", "status", "unit_price", "total_price", "cancelled_at", "created_at", "updated_at",
        )

    def create(self, validated_data):
        guests = validated_data.pop("guests", [])
        return create_booking(user=self.context["request"].user, guests=guests, **validated_data)


class BookingActionSerializer(serializers.Serializer):
    reason = serializers.CharField(required=False, allow_blank=True)
