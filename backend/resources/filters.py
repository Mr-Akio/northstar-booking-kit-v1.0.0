from __future__ import annotations

import django_filters

from resources.models import Resource


class ResourceFilterSet(django_filters.FilterSet):
    min_capacity = django_filters.NumberFilter(field_name="capacity", lookup_expr="gte")
    max_capacity = django_filters.NumberFilter(field_name="capacity", lookup_expr="lte")
    min_price = django_filters.NumberFilter(field_name="price", lookup_expr="gte")
    max_price = django_filters.NumberFilter(field_name="price", lookup_expr="lte")
    category = django_filters.CharFilter(field_name="category")
    status = django_filters.CharFilter(field_name="status")
    available_date = django_filters.DateFilter(method="filter_available_date")

    class Meta:
        model = Resource
        fields = ("category", "status", "is_active")

    def filter_available_date(self, queryset, name, value):
        weekday = value.weekday()
        queryset = queryset.filter(availability_rules__day_of_week=weekday, availability_rules__is_active=True).exclude(
            blackout_periods__start_datetime__date__lte=value,
            blackout_periods__end_datetime__date__gte=value,
        )
        return queryset.distinct()
