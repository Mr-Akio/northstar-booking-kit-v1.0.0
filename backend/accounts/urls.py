from django.urls import path

from accounts.views import (
    AdminUserListView,
    ChangePasswordView,
    CurrentUserView,
    ForgotPasswordView,
    LoginView,
    LogoutView,
    RefreshTokenView,
    RegisterView,
    ResetPasswordView,
    VerifyEmailView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("login/", LoginView.as_view(), name="auth-login"),
    path("logout/", LogoutView.as_view(), name="auth-logout"),
    path("token/refresh/", RefreshTokenView.as_view(), name="auth-token-refresh"),
    path("verify-email/", VerifyEmailView.as_view(), name="auth-verify-email"),
    path("forgot-password/", ForgotPasswordView.as_view(), name="auth-forgot-password"),
    path("reset-password/", ResetPasswordView.as_view(), name="auth-reset-password"),
    path("me/", CurrentUserView.as_view(), name="auth-me"),
    path("change-password/", ChangePasswordView.as_view(), name="auth-change-password"),
    path("users/", AdminUserListView.as_view(), name="auth-users"),
]
