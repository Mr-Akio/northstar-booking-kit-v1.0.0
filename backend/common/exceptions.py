from __future__ import annotations

from typing import Any

from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import status
from rest_framework.exceptions import APIException, ErrorDetail, ValidationError
from rest_framework.response import Response
from rest_framework.views import exception_handler


def _format_fields(detail: Any) -> dict[str, list[str]]:
    if isinstance(detail, dict):
        formatted: dict[str, list[str]] = {}
        for field, errors in detail.items():
            if isinstance(errors, (list, tuple)):
                formatted[field] = [str(error) for error in errors]
            else:
                formatted[field] = [str(errors)]
        return formatted
    return {}


def _extract_code(exc: Exception) -> str:
    if isinstance(exc, APIException):
        detail = exc.get_codes()
        if isinstance(detail, dict):
            first_value = next(iter(detail.values()), "api_error")
            if isinstance(first_value, list):
                return str(first_value[0])
            return str(first_value)
        if isinstance(detail, list):
            return str(detail[0])
        return str(detail)
    return "server_error"


def _extract_message(detail: Any, fallback: str) -> str:
    if isinstance(detail, dict):
        first_value = next(iter(detail.values()), None)
        if isinstance(first_value, list) and first_value:
            return str(first_value[0])
        if first_value is not None:
            return str(first_value)
        return fallback
    if isinstance(detail, list) and detail:
        return str(detail[0])
    if isinstance(detail, ErrorDetail):
        return str(detail)
    return fallback


def api_exception_handler(exc: Exception, context: dict[str, Any]) -> Response:
    if isinstance(exc, DjangoValidationError):
        exc = ValidationError(detail=exc.message_dict if hasattr(exc, "message_dict") else exc.messages)

    response = exception_handler(exc, context)
    if response is None:
        return Response({"error": {"code": "server_error", "message": "An unexpected error occurred.", "fields": {}}}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    message = _extract_message(response.data, getattr(exc, "default_detail", "Request failed."))
    response.data = {"error": {"code": _extract_code(exc), "message": message, "fields": _format_fields(response.data)}}
    return response
