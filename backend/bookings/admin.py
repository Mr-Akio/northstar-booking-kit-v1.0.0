from django.contrib import admin

from bookings.models import Booking, BookingGuest


class BookingGuestInline(admin.TabularInline):
    model = BookingGuest
    extra = 0


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ("booking_reference", "resource", "user", "status", "start_datetime", "end_datetime", "total_price")
    list_filter = ("status",)
    search_fields = ("booking_reference", "user__email", "resource__name")
    inlines = (BookingGuestInline,)
