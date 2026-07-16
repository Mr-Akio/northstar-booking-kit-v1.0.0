from __future__ import annotations

from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import generics, serializers, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.models import User
from accounts.serializers import ChangePasswordSerializer, ForgotPasswordSerializer, LoginSerializer, ProfileUpdateSerializer, RegistrationSerializer, ResetPasswordSerializer, UserSerializer, VerifyEmailSerializer
from common.permissions import IsAdminRole


def _set_refresh_cookie(response: Response, refresh_token: str) -> None:
    response.set_cookie(settings.REFRESH_COOKIE_NAME, refresh_token, httponly=True, secure=settings.REFRESH_COOKIE_SECURE, samesite=settings.REFRESH_COOKIE_SAMESITE, path=settings.REFRESH_COOKIE_PATH)


def _clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(settings.REFRESH_COOKIE_NAME, path=settings.REFRESH_COOKIE_PATH, samesite=settings.REFRESH_COOKIE_SAMESITE)


def _issue_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {"access": str(refresh.access_token), "refresh": str(refresh)}


def _send_action_email(email: str, subject: str, url: str) -> None:
    send_mail(subject=subject, message=f"Use this link: {url}", from_email=settings.DEFAULT_FROM_EMAIL, recipient_list=[email], fail_silently=False)


class RegisterView(APIView):
    permission_classes = [AllowAny]
    serializer_class = RegistrationSerializer

    @extend_schema(request=RegistrationSerializer, responses={201: UserSerializer})
    def post(self, request):
        serializer = RegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        verify_url = f"{settings.FRONTEND_URL}/verify-email?uid={uid}&token={token}"
        _send_action_email(user.email, "Verify your account", verify_url)
        return Response({"data": UserSerializer(user).data, "meta": {"verification_url": verify_url if settings.DEBUG else None}}, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    @extend_schema(request=LoginSerializer)
    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        tokens = _issue_tokens_for_user(user)
        response = Response({"data": {"access": tokens["access"], "user": UserSerializer(user).data}}, status=status.HTTP_200_OK)
        _set_refresh_cookie(response, tokens["refresh"])
        return response


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(request=inline_serializer("LogoutSerializer", fields={"refresh": serializers.CharField(required=False)}), responses={204: None})
    def post(self, request):
        refresh_token = request.data.get("refresh") or request.COOKIES.get(settings.REFRESH_COOKIE_NAME)
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except TokenError:
                pass
        response = Response(status=status.HTTP_204_NO_CONTENT)
        _clear_refresh_cookie(response)
        return response


class RefreshTokenView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(request=inline_serializer("RefreshRequest", fields={"refresh": serializers.CharField(required=False)}), responses={200: inline_serializer("RefreshResponse", fields={"data": serializers.JSONField()})})
    def post(self, request):
        serializer = TokenRefreshSerializer(data={"refresh": request.data.get("refresh") or request.COOKIES.get(settings.REFRESH_COOKIE_NAME)})
        serializer.is_valid(raise_exception=True)
        response = Response({"data": {"access": serializer.validated_data["access"]}}, status=status.HTTP_200_OK)
        if "refresh" in serializer.validated_data:
            _set_refresh_cookie(response, serializer.validated_data["refresh"])
        return response


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    @extend_schema(responses={200: UserSerializer})
    def get(self, request):
        return Response({"data": UserSerializer(request.user).data})

    @extend_schema(request=ProfileUpdateSerializer, responses={200: UserSerializer})
    def patch(self, request):
        serializer = ProfileUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"data": UserSerializer(request.user).data})


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ChangePasswordSerializer

    @extend_schema(request=ChangePasswordSerializer)
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save(update_fields=["password", "updated_at"])
        return Response(status=status.HTTP_204_NO_CONTENT)


class VerifyEmailView(APIView):
    permission_classes = [AllowAny]
    serializer_class = VerifyEmailSerializer

    @extend_schema(request=VerifyEmailSerializer)
    def post(self, request):
        serializer = VerifyEmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        user.is_verified = True
        user.save(update_fields=["is_verified", "updated_at"])
        return Response({"data": UserSerializer(user).data})


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]
    serializer_class = ForgotPasswordSerializer

    @extend_schema(request=ForgotPasswordSerializer)
    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = User.objects.filter(email=serializer.validated_data["email"], is_active=True).first()
        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            reset_url = f"{settings.FRONTEND_URL}/reset-password?uid={uid}&token={token}"
            _send_action_email(user.email, "Reset your password", reset_url)
        return Response({"data": {"message": "If the account exists, a reset link has been sent."}})


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]
    serializer_class = ResetPasswordSerializer

    @extend_schema(request=ResetPasswordSerializer)
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        user.set_password(serializer.validated_data["new_password"])
        user.save(update_fields=["password", "updated_at"])
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminUserListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated, IsAdminRole]
    serializer_class = UserSerializer
    queryset = User.objects.order_by("email")
