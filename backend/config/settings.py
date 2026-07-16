from __future__ import annotations

import os
import sys
from datetime import timedelta
from pathlib import Path

import dj_database_url
from django.core.exceptions import ImproperlyConfigured
from common.env import load_dotenv_file
from common.hosting import extend_allowed_hosts

BASE_DIR = Path(__file__).resolve().parent.parent
for dotenv_path in (BASE_DIR.parent / ".env", BASE_DIR / ".env"):
    load_dotenv_file(dotenv_path, os.environ)


def get_env(name: str, *, default: str | None = None, required: bool = False) -> str:
    value = os.getenv(name, default)
    if required and not value:
        raise ImproperlyConfigured(
            f"Missing required environment variable: {name}. "
            "Copy .env.example and configure the project before starting the app."
        )
    return value or ""


def get_bool(name: str, default: bool = False) -> bool:
    return get_env(name, default=str(default)).lower() in {"1", "true", "yes", "on"}


def get_int(name: str, default: int) -> int:
    return int(get_env(name, default=str(default)))


def get_list(name: str, default: str = "") -> list[str]:
    raw = get_env(name, default=default)
    return [item.strip() for item in raw.split(",") if item.strip()]


RUNNING_TESTS = "test" in sys.argv or "pytest" in " ".join(sys.argv)
RUNNING_MAKEMIGRATIONS = "makemigrations" in sys.argv

SECRET_KEY = get_env(
    "DJANGO_SECRET_KEY",
    default="test-secret-key-for-local-verification-only-change-me",
    required=not (RUNNING_MAKEMIGRATIONS or RUNNING_TESTS),
)
DEBUG = get_bool("DJANGO_DEBUG", False)
ALLOWED_HOSTS = get_list("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1")
ALLOWED_HOSTS = extend_allowed_hosts(ALLOWED_HOSTS, get_env("RENDER_EXTERNAL_HOSTNAME", default=""))

if os.getenv("DATABASE_URL"):
    DATABASES = {
        "default": dj_database_url.parse(
            get_env("DATABASE_URL"),
            conn_max_age=600,
            ssl_require=get_bool("DATABASE_SSL_REQUIRED", False),
        )
    }
elif RUNNING_TESTS:
    DATABASES = {"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": BASE_DIR / "test.sqlite3"}}
else:
    raise ImproperlyConfigured(
        "Missing required environment variable: DATABASE_URL. "
        "Use PostgreSQL in development and production as documented in .env.example."
    )

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.postgres",
    "corsheaders",
    "django_filters",
    "drf_spectacular",
    "rest_framework",
    "rest_framework_simplejwt.token_blacklist",
    "common",
    "accounts",
    "resources",
    "bookings",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator", "OPTIONS": {"min_length": 8}},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
AUTH_USER_MODEL = "accounts.User"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticatedOrReadOnly",
    ),
    "DEFAULT_FILTER_BACKENDS": (
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.OrderingFilter",
        "rest_framework.filters.SearchFilter",
    ),
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_PAGINATION_CLASS": "common.pagination.StandardResultsSetPagination",
    "PAGE_SIZE": 12,
    "DEFAULT_THROTTLE_CLASSES": (
        "common.throttles.AuthBurstThrottle",
        "common.throttles.BookingBurstThrottle",
    ),
    "DEFAULT_THROTTLE_RATES": {
        "auth_burst": "10/minute",
        "booking_burst": "20/hour",
    },
    "EXCEPTION_HANDLER": "common.exceptions.api_exception_handler",
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=get_int("JWT_ACCESS_TOKEN_MINUTES", 15)),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=get_int("JWT_REFRESH_TOKEN_DAYS", 7)),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}

SPECTACULAR_SETTINGS = {
    "TITLE": "Northstar Booking Kit API",
    "DESCRIPTION": "Reusable booking starter kit API for generic time-slot reservations.",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
}

CORS_ALLOWED_ORIGINS = get_list("CORS_ALLOWED_ORIGINS", "http://localhost:3000")
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = get_list("CSRF_TRUSTED_ORIGINS", "http://localhost:3000")

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SESSION_COOKIE_SECURE = get_bool("SESSION_COOKIE_SECURE", not DEBUG)
CSRF_COOKIE_SECURE = get_bool("CSRF_COOKIE_SECURE", not DEBUG)
CSRF_COOKIE_HTTPONLY = False
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"
SECURE_REFERRER_POLICY = "same-origin"

EMAIL_BACKEND = get_env("EMAIL_BACKEND", default="django.core.mail.backends.console.EmailBackend")
EMAIL_HOST = get_env("EMAIL_HOST", default="")
EMAIL_PORT = get_int("EMAIL_PORT", 587)
EMAIL_HOST_USER = get_env("EMAIL_HOST_USER", default="")
EMAIL_HOST_PASSWORD = get_env("EMAIL_HOST_PASSWORD", default="")
EMAIL_USE_TLS = get_bool("EMAIL_USE_TLS", True)
DEFAULT_FROM_EMAIL = get_env("DEFAULT_FROM_EMAIL", default="no-reply@northstar.local")

FRONTEND_URL = get_env("FRONTEND_URL", default="http://localhost:3000")
BOOKING_PENDING_LOCKS_SLOT = get_bool("BOOKING_PENDING_LOCKS_SLOT", False)
BOOKING_DEFAULT_CURRENCY = get_env("BOOKING_DEFAULT_CURRENCY", default="USD")
REFRESH_COOKIE_NAME = get_env("REFRESH_COOKIE_NAME", default="northstar_refresh")
REFRESH_COOKIE_SECURE = get_bool("REFRESH_COOKIE_SECURE", not DEBUG)
REFRESH_COOKIE_SAMESITE = get_env("REFRESH_COOKIE_SAMESITE", default="Lax")
REFRESH_COOKIE_PATH = get_env("REFRESH_COOKIE_PATH", default="/api/v1/auth/")

