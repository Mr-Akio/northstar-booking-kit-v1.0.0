from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User


class AuthenticationTests(APITestCase):
    def test_registration_creates_customer(self):
        payload = {
            "email": "new@example.com",
            "first_name": "New",
            "last_name": "User",
            "password": "StrongPass123!",
            "confirm_password": "StrongPass123!",
        }
        response = self.client.post(reverse("auth-register"), payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email="new@example.com", role="customer").exists())

    def test_login_returns_access_and_refresh_cookie(self):
        user = User.objects.create_user(email="login@example.com", password="StrongPass123!", first_name="Log", last_name="In")
        response = self.client.post(reverse("auth-login"), {"email": user.email, "password": "StrongPass123!"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data["data"])
        self.assertIn("northstar_refresh", response.cookies)

    def test_refresh_token_uses_cookie(self):
        user = User.objects.create_user(email="refresh@example.com", password="StrongPass123!", first_name="Re", last_name="Fresh")
        login_response = self.client.post(reverse("auth-login"), {"email": user.email, "password": "StrongPass123!"}, format="json")
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        response = self.client.post(reverse("auth-token-refresh"), {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data["data"])
