from __future__ import annotations

from drf_spectacular.utils import extend_schema
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from bookings.models import Booking, BookingStatus
from bookings.serializers import BookingActionSerializer, BookingSerializer
from bookings.services import transition_booking


class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "post", "patch"]
    queryset = Booking.objects.none()

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Booking.objects.none()
        queryset = Booking.objects.select_related("resource", "user", "resource__primary_staff").prefetch_related("guests")
        user = self.request.user
        if user.is_admin:
            return queryset
        if user.is_staff_role:
            return queryset.filter(resource__primary_staff=user)
        return queryset.filter(user=user)

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        if isinstance(response.data, dict) and "data" in response.data:
            return response
        return Response({"data": response.data})

    def retrieve(self, request, *args, **kwargs):
        return Response({"data": self.get_serializer(self.get_object()).data})

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        return Response({"data": response.data}, status=response.status_code)

    def _can_manage_booking(self, user, booking: Booking) -> bool:
        if user.is_admin:
            return True
        return user.is_staff_role and booking.resource.primary_staff_id == user.id

    def _transition(self, request, booking: Booking, target_status: str, customer_allowed: bool = False):
        if request.user == booking.user and customer_allowed:
            pass
        elif not self._can_manage_booking(request.user, booking):
            return Response({"error": {"code": "forbidden", "message": "You do not have access to this booking.", "fields": {}}}, status=status.HTTP_403_FORBIDDEN)

        serializer = BookingActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        booking = transition_booking(booking=booking, actor=request.user, target_status=target_status, reason=serializer.validated_data.get("reason", ""))
        return Response({"data": self.get_serializer(booking).data})

    @extend_schema(request=BookingActionSerializer)
    @action(detail=True, methods=["post"])
    def confirm(self, request, pk=None):
        booking = self.get_object()
        if request.user == booking.user:
            return Response({"error": {"code": "forbidden", "message": "Customers cannot confirm bookings.", "fields": {}}}, status=status.HTTP_403_FORBIDDEN)
        return self._transition(request, booking, BookingStatus.CONFIRMED)

    @extend_schema(request=BookingActionSerializer)
    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        return self._transition(request, self.get_object(), BookingStatus.CANCELLED, customer_allowed=True)

    @extend_schema(request=BookingActionSerializer)
    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        booking = self.get_object()
        if request.user == booking.user:
            return Response({"error": {"code": "forbidden", "message": "Customers cannot reject bookings.", "fields": {}}}, status=status.HTTP_403_FORBIDDEN)
        return self._transition(request, booking, BookingStatus.REJECTED)

    @extend_schema(request=BookingActionSerializer)
    @action(detail=True, methods=["post"])
    def complete(self, request, pk=None):
        booking = self.get_object()
        if request.user == booking.user:
            return Response({"error": {"code": "forbidden", "message": "Customers cannot complete bookings.", "fields": {}}}, status=status.HTTP_403_FORBIDDEN)
        return self._transition(request, booking, BookingStatus.COMPLETED)
