from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework.reverse import reverse

from .models import User


class LoginTests(APITestCase):
    """SS-US-01: Login (ADMIN, USER). See tests/001-system-security/test_cases.md."""

    def _register(self, **overrides):
        payload = {
            'username': overrides.get('username', 'testqc_user'),
            'email': overrides.get('email', 'testqc_user@example.com'),
            'password': overrides.get('password', 'TestQC-Passw0rd!'),
        }
        response = self.client.post(reverse('user-list-create'), payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        return payload

    def test_tc01_successful_login_returns_token_pair(self):
        user = self._register(email='tc01@example.com')

        response = self.client.post(reverse('token_obtain_pair'), {
            'email': user['email'],
            'password': user['password'],
        })

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data.get('access'))
        self.assertTrue(response.data.get('refresh'))

    def test_tc03_wrong_password_rejected_generically(self):
        user = self._register(email='tc03@example.com')

        response = self.client.post(reverse('token_obtain_pair'), {
            'email': user['email'],
            'password': 'WrongPassword!123',
        })

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertNotIn('access', response.data)
        self.assertNotIn('email', response.data)
        self.assertNotIn('password', response.data)

    def test_tc05_deactivated_account_rejected_same_as_wrong_credentials(self):
        user = self._register(email='tc05@example.com')
        User.objects.filter(email=user['email']).update(is_active=False)

        response = self.client.post(reverse('token_obtain_pair'), {
            'email': user['email'],
            'password': user['password'],
        })

        wrong_password_response = self.client.post(reverse('token_obtain_pair'), {
            'email': 'nonexistent-user@example.com',
            'password': 'anything',
        })

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data, wrong_password_response.data)

    def test_tc06_dual_role_account_single_login_one_token_pair(self):
        # No Role table exists yet — is_staff/is_superuser stand in for "holds elevated,
        # dual-capability access" per data-model.md's documented proxy note.
        user = self._register(email='tc06@example.com')
        User.objects.filter(email=user['email']).update(is_staff=True, is_superuser=True)

        response = self.client.post(reverse('token_obtain_pair'), {
            'email': user['email'],
            'password': user['password'],
        })

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertCountEqual(response.data.keys(), ['access', 'refresh'])

    def test_tc07_missing_password_rejected_with_400(self):
        user = self._register(email='tc07@example.com')

        response = self.client.post(reverse('token_obtain_pair'), {
            'email': user['email'],
        })

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', response.data)

    def test_tc09_repeated_failed_attempts_no_lockout(self):
        user = self._register(email='tc09@example.com')

        for _ in range(3):
            response = self.client.post(reverse('token_obtain_pair'), {
                'email': user['email'],
                'password': 'WrongPassword!123',
            })
            self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # A subsequent correct login must still succeed — no lockout state was introduced.
        response = self.client.post(reverse('token_obtain_pair'), {
            'email': user['email'],
            'password': user['password'],
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
