from __future__ import annotations

from django.db import transaction
from rest_framework import serializers

from accounts.models import User
from resources.models import AvailabilityRule, BlackoutPeriod, Resource, ResourceImage


class ResourceImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResourceImage
        fields = ("id", "image_url", "alt_text", "sort_order")
        read_only_fields = ("id",)


class AvailabilityRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = AvailabilityRule
        fields = ("id", "day_of_week", "start_time", "end_time", "is_active")
        read_only_fields = ("id",)


class BlackoutPeriodSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlackoutPeriod
        fields = ("id", "start_datetime", "end_datetime", "reason")
        read_only_fields = ("id",)


class StaffAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email", "first_name", "last_name")


class ResourceSerializer(serializers.ModelSerializer):
    images = ResourceImageSerializer(many=True, required=False)
    availability_rules = AvailabilityRuleSerializer(many=True, required=False)
    blackout_periods = BlackoutPeriodSerializer(many=True, required=False)
    primary_staff = serializers.PrimaryKeyRelatedField(queryset=User.objects.filter(role__in=["staff", "admin"]), allow_null=True, required=False)
    primary_staff_details = StaffAssignmentSerializer(source="primary_staff", read_only=True)
    created_by = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Resource
        fields = (
            "id", "name", "slug", "short_description", "full_description", "category", "capacity", "price",
            "currency", "price_mode", "duration_mode", "min_booking_duration", "max_booking_duration", "status",
            "is_active", "created_by", "primary_staff", "primary_staff_details", "images", "availability_rules",
            "blackout_periods", "created_at", "updated_at",
        )
        read_only_fields = ("id", "slug", "created_by", "created_at", "updated_at")

    def _sync_nested(self, instance, model_cls, payload, relation_name):
        getattr(instance, relation_name).all().delete()
        for item in payload:
            model_cls.objects.create(resource=instance, **item)

    @transaction.atomic
    def create(self, validated_data):
        images = validated_data.pop("images", [])
        availability_rules = validated_data.pop("availability_rules", [])
        blackout_periods = validated_data.pop("blackout_periods", [])
        resource = Resource.objects.create(created_by=self.context["request"].user, **validated_data)
        self._sync_nested(resource, ResourceImage, images, "images")
        self._sync_nested(resource, AvailabilityRule, availability_rules, "availability_rules")
        self._sync_nested(resource, BlackoutPeriod, blackout_periods, "blackout_periods")
        return resource

    @transaction.atomic
    def update(self, instance, validated_data):
        images = validated_data.pop("images", None)
        availability_rules = validated_data.pop("availability_rules", None)
        blackout_periods = validated_data.pop("blackout_periods", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if images is not None:
            self._sync_nested(instance, ResourceImage, images, "images")
        if availability_rules is not None:
            self._sync_nested(instance, AvailabilityRule, availability_rules, "availability_rules")
        if blackout_periods is not None:
            self._sync_nested(instance, BlackoutPeriod, blackout_periods, "blackout_periods")
        return instance
