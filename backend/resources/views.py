from __future__ import annotations

from datetime import date, timedelta

from django.db.models import Q
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from common.permissions import IsStaffOrAdminRole
from resources.filters import ResourceFilterSet
from resources.models import Resource, ResourceStatus
from resources.selectors import serialize_availability_calendar
from resources.serializers import ResourceSerializer


class ResourceAccessMixin:
    def user_can_manage(self, user, resource: Resource) -> bool:
        if not user.is_authenticated:
            return False
        if user.is_admin:
            return True
        return user.is_staff_role and resource.primary_staff_id == user.id


class ResourceViewSet(ResourceAccessMixin, viewsets.ModelViewSet):
    serializer_class = ResourceSerializer
    filterset_class = ResourceFilterSet
    search_fields = ("name", "short_description", "full_description")
    ordering_fields = ("name", "price", "capacity", "created_at")
    ordering = ("name",)
    lookup_field = "pk"

    def get_queryset(self):
        queryset = Resource.objects.prefetch_related("images", "availability_rules", "blackout_periods")
        user = self.request.user
        if self.action in {"list", "retrieve", "retrieve_by_slug", "availability"}:
            if user.is_authenticated and user.is_admin:
                return queryset
            if user.is_authenticated and user.is_staff_role:
                return queryset.filter(Q(primary_staff=user) | Q(status=ResourceStatus.PUBLISHED, is_active=True)).distinct()
            return queryset.filter(status=ResourceStatus.PUBLISHED, is_active=True)
        return queryset

    def get_permissions(self):
        if self.action in {"list", "retrieve", "retrieve_by_slug", "availability"}:
            return [AllowAny()]
        return [IsAuthenticated(), IsStaffOrAdminRole()]

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if not self.user_can_manage(request.user, instance):
            return Response({"error": {"code": "forbidden", "message": "You do not have access to this resource.", "fields": {}}}, status=status.HTTP_403_FORBIDDEN)
        response = super().update(request, *args, **kwargs)
        return Response({"data": response.data}, status=response.status_code)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if not self.user_can_manage(request.user, instance):
            return Response({"error": {"code": "forbidden", "message": "You do not have access to this resource.", "fields": {}}}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=["get"], url_path=r"slug/(?P<slug>[-a-zA-Z0-9_]+)", permission_classes=[AllowAny])
    def retrieve_by_slug(self, request, slug=None):
        resource = get_object_or_404(self.get_queryset(), slug=slug)
        return Response({"data": self.get_serializer(resource).data})

    @extend_schema(parameters=[OpenApiParameter(name="start_date", required=False, type=str), OpenApiParameter(name="end_date", required=False, type=str)])
    @action(detail=True, methods=["get"], permission_classes=[AllowAny])
    def availability(self, request, pk=None):
        resource = self.get_object()
        start_date = date.fromisoformat(request.query_params.get("start_date", date.today().isoformat()))
        end_date = date.fromisoformat(request.query_params.get("end_date", (start_date + timedelta(days=6)).isoformat()))
        return Response({"data": serialize_availability_calendar(resource, start_date, end_date)})

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
