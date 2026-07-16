from __future__ import annotations

from dataclasses import asdict, dataclass
from datetime import date, datetime, time, timedelta, timezone

from bookings.models import Booking
from resources.models import Resource


@dataclass
class AvailabilityWindow:
    start: str
    end: str
    is_available: bool
    reason: str | None = None


def serialize_availability_calendar(resource: Resource, start_date: date, end_date: date) -> list[dict]:
    payload: list[dict] = []
    blackout_periods = list(resource.blackout_periods.all())
    bookings = list(
        Booking.objects.filter(
            resource=resource,
            blocks_availability=True,
            start_datetime__lt=datetime.combine(end_date + timedelta(days=1), time.min, tzinfo=timezone.utc),
            end_datetime__gte=datetime.combine(start_date, time.min, tzinfo=timezone.utc),
        )
    )
    current_date = start_date
    rules = list(resource.availability_rules.filter(is_active=True))

    while current_date <= end_date:
        day_rules = [rule for rule in rules if rule.day_of_week == current_date.weekday()]
        windows: list[dict] = []
        for rule in day_rules:
            start_dt = datetime.combine(current_date, rule.start_time, tzinfo=timezone.utc)
            end_dt = datetime.combine(current_date, rule.end_time, tzinfo=timezone.utc)
            blocked_reason = None
            for blackout in blackout_periods:
                if blackout.start_datetime < end_dt and blackout.end_datetime > start_dt:
                    blocked_reason = blackout.reason
                    break
            if blocked_reason is None:
                for booking in bookings:
                    if booking.start_datetime < end_dt and booking.end_datetime > start_dt:
                        blocked_reason = f"Booked by {booking.status} reservation"
                        break
            windows.append(asdict(AvailabilityWindow(start=start_dt.isoformat(), end=end_dt.isoformat(), is_available=blocked_reason is None, reason=blocked_reason)))
        payload.append({"date": current_date.isoformat(), "windows": windows})
        current_date += timedelta(days=1)
    return payload
