from django.contrib import admin

from resources.models import AvailabilityRule, BlackoutPeriod, Resource, ResourceImage


class ResourceImageInline(admin.TabularInline):
    model = ResourceImage
    extra = 0


class AvailabilityRuleInline(admin.TabularInline):
    model = AvailabilityRule
    extra = 0


class BlackoutPeriodInline(admin.TabularInline):
    model = BlackoutPeriod
    extra = 0


@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "status", "is_active", "primary_staff", "created_at")
    list_filter = ("category", "status", "is_active")
    search_fields = ("name", "slug", "short_description")
    inlines = (ResourceImageInline, AvailabilityRuleInline, BlackoutPeriodInline)
