from rest_framework.throttling import ScopedRateThrottle


class AuthBurstThrottle(ScopedRateThrottle):
    scope = "auth_burst"


class BookingBurstThrottle(ScopedRateThrottle):
    scope = "booking_burst"
