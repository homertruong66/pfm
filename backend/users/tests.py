from rest_framework import status
from rest_framework.test import APIClient, APITestCase
from rest_framework.reverse import reverse

from roles.models import Role

from .models import User


class LoginTests(APITestCase):
    """SS-US-01: Login (ADMIN, USER). See specs/001-system-security/test_cases.md."""

    def _register(self, **overrides):
        # Accounts are created with the ORM: POST /api/v1/users/ is ADMIN-only since UM-US-01
        # (SRS: no self-service registration), so it is not available as an anonymous fixture.
        payload = {
            'username': overrides.get('username', 'testqc_user'),
            'email': overrides.get('email', 'testqc_user@example.com'),
            'password': overrides.get('password', 'TestQC-Passw0rd!'),
        }
        User.objects.create_user(**payload)
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

    def test_tc06_dual_role_account_single_login_covers_both_roles(self):
        # AC-04: one login, one token, and that token works for an ADMIN action AND a USER action.
        # The USER-only account is the control: it logs in the same way but is refused the ADMIN
        # action, so this test fails if login (or the token) ignored the roles an account holds.
        dual = self._register(email='tc06-dual@example.com')
        User.objects.get(email=dual['email']).roles.add(
            *Role.objects.filter(code__in=[Role.Code.ADMIN, Role.Code.USER]))
        user_only = self._register(username='tc06_user', email='tc06-user@example.com')
        User.objects.get(email=user_only['email']).roles.add(Role.objects.get(code=Role.Code.USER))

        def login(account):
            return self.client.post(reverse('token_obtain_pair'), {
                'email': account['email'],
                'password': account['password'],
            })

        def create_account_as(token, email):
            client = APIClient()
            client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
            return client, client.post(reverse('user-create'), {
                'full_name': 'Created By Test', 'email': email, 'password': 'TestQC-Passw0rd!',
            })

        dual_login = login(dual)
        self.assertEqual(dual_login.status_code, status.HTTP_200_OK)
        self.assertCountEqual(dual_login.data.keys(), ['access', 'refresh'])  # no per-role step or field

        # ADMIN action with the single token
        client, admin_action = create_account_as(dual_login.data['access'], 'created-by-dual@example.com')
        self.assertEqual(admin_action.status_code, status.HTTP_201_CREATED)
        # USER action with the same token
        self.assertEqual(client.get('/api/v1/wallets/').status_code, status.HTTP_200_OK)

        # Control: a USER-only account is refused the ADMIN action.
        _, refused = create_account_as(login(user_only).data['access'], 'created-by-user-only@example.com')
        self.assertEqual(refused.status_code, status.HTTP_403_FORBIDDEN)

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

    def test_tc10_unregistered_email_rejected_with_the_same_generic_error(self):
        known = self._register(email='tc10@example.com')

        unknown = self.client.post(reverse('token_obtain_pair'), {
            'email': 'nobody-registered@example.com',
            'password': 'TestQC-Passw0rd!',
        })
        wrong_password = self.client.post(reverse('token_obtain_pair'), {
            'email': known['email'],
            'password': 'WrongPassword!123',
        })

        self.assertEqual(unknown.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(unknown.data, wrong_password.data)  # indistinguishable: email existence not revealed

    def test_tc11_login_events_are_logged_without_credentials(self):
        user = self._register(email='tc11@example.com')

        with self.assertLogs('users.auth', level='INFO') as success_logs:
            self.client.post(reverse('token_obtain_pair'), {'email': user['email'], 'password': user['password']})
        with self.assertLogs('config.exceptions', level='WARNING') as failure_logs:
            self.client.post(reverse('token_obtain_pair'), {'email': user['email'], 'password': 'WrongPassword!123'})

        self.assertIn('login succeeded', success_logs.output[0])
        self.assertIn('401', failure_logs.output[0])
        for line in success_logs.output + failure_logs.output:
            self.assertNotIn(user['email'], line)
            self.assertNotIn(user['password'], line)
            self.assertNotIn('WrongPassword!123', line)


class CreateUserTests(APITestCase):
    """UM-US-01: Create a User (ADMIN). See specs/002-user-management/test_cases.md."""

    PASSWORD = 'TestQC-Passw0rd!'

    def setUp(self):
        self.admin = User.objects.create_user(
            username='admin@example.com', email='admin@example.com', password='Admin-Passw0rd!')
        self.admin.roles.add(Role.objects.get(code=Role.Code.ADMIN))
        self.url = reverse('user-create')
        self.client.force_authenticate(self.admin)

    def _payload(self, **overrides):
        data = {'full_name': 'Homer Truong', 'email': 'homer@example.com', 'password': self.PASSWORD}
        data.update(overrides)
        return {k: v for k, v in data.items() if v is not None}

    def _login(self, email, password):
        return APIClient().post(reverse('token_obtain_pair'), {'email': email, 'password': password})

    def test_tc01_admin_creates_user_and_new_user_can_log_in(self):
        response = self.client.post(self.url, self._payload())

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertCountEqual(response.data.keys(), ['id', 'full_name', 'email', 'is_active', 'created_at'])
        self.assertEqual(response.data['full_name'], 'Homer Truong')
        self.assertEqual(response.data['email'], 'homer@example.com')
        self.assertTrue(response.data['is_active'])
        login = self._login('homer@example.com', self.PASSWORD)
        self.assertEqual(login.status_code, status.HTTP_200_OK)
        self.assertTrue(login.data.get('access'))
        self.assertTrue(login.data.get('refresh'))

    def test_tc03_missing_email_rejected(self):
        response = self.client.post(self.url, self._payload(email=None))

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['email'], ['Email is required'])
        self.assertFalse(User.objects.filter(full_name='Homer Truong').exists())

    def test_tc05_existing_email_rejected_with_account_already_exists(self):
        self.client.post(self.url, self._payload())

        response = self.client.post(self.url, self._payload(full_name='Someone Else'))

        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(response.data, {'detail': 'Account already exists', 'code': 'USER_ALREADY_EXISTS'})
        self.assertEqual(User.objects.filter(email='homer@example.com').count(), 1)

    def test_tc07_new_account_is_user_only_and_cannot_create_accounts(self):
        self.client.post(self.url, self._payload())
        new_user = User.objects.get(email='homer@example.com')
        token = self._login('homer@example.com', self.PASSWORD).data['access']

        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = client.post(self.url, self._payload(email='second@example.com'))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(client.get('/api/v1/wallets/').status_code, status.HTTP_200_OK)  # reaches its own data
        self.assertEqual(list(new_user.roles.values_list('code', flat=True)), ['USER'])
        self.assertFalse(User.objects.filter(email='second@example.com').exists())

    def test_tc08_response_never_contains_the_password(self):
        response = self.client.post(self.url, self._payload())

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertNotIn('password', response.data)
        self.assertNotIn(self.PASSWORD, response.content.decode())

    def test_tc09_unauthenticated_caller_rejected(self):
        self.client.force_authenticate(None)

        response = self.client.post(self.url, self._payload())

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertFalse(User.objects.filter(email='homer@example.com').exists())

    def test_tc10_user_only_caller_rejected(self):
        plain_user = User.objects.create_user(
            username='plain@example.com', email='plain@example.com', password='Plain-Passw0rd!')
        plain_user.roles.add(Role.objects.get(code=Role.Code.USER))
        self.client.force_authenticate(plain_user)

        with self.assertLogs('config.exceptions', level='WARNING') as logs:
            response = self.client.post(self.url, self._payload())

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn(f'user_id={plain_user.id}', logs.output[0])
        self.assertFalse(User.objects.filter(email='homer@example.com').exists())

    def test_tc12_missing_full_name_or_password_rejected(self):
        no_name = self.client.post(self.url, self._payload(full_name=None))
        no_password = self.client.post(self.url, self._payload(password=None))

        self.assertEqual(no_name.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(no_name.data['full_name'], ['Full name is required'])
        self.assertEqual(no_password.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(no_password.data['password'], ['Password is required'])
        self.assertFalse(User.objects.filter(email='homer@example.com').exists())

    def test_tc14_invalid_or_overlong_email_rejected(self):
        invalid = self.client.post(self.url, self._payload(email='not-an-email'))
        too_long = self.client.post(self.url, self._payload(email='a' * 145 + '@example.com'))

        for response in (invalid, too_long):
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
            self.assertEqual(response.data['email'], ['Enter a valid email address'])
        self.assertEqual(User.objects.count(), 1)  # only the setUp admin

    def test_tc15_password_shorter_than_eight_characters_rejected(self):
        short = self.client.post(self.url, self._payload(password='1234567'))
        exact = self.client.post(self.url, self._payload(password='12345678'))

        self.assertEqual(short.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(short.data['password'], ['Password must be at least 8 characters'])
        self.assertEqual(exact.status_code, status.HTTP_201_CREATED)

    def test_tc16_full_name_longer_than_150_characters_rejected(self):
        too_long = self.client.post(self.url, self._payload(full_name='x' * 151, email='long@example.com'))
        exact = self.client.post(self.url, self._payload(full_name='x' * 150, email='exact@example.com'))

        self.assertEqual(too_long.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(too_long.data['full_name'], ['Full name must be at most 150 characters'])
        self.assertFalse(User.objects.filter(email='long@example.com').exists())
        self.assertEqual(exact.status_code, status.HTTP_201_CREATED)

    def test_tc17_same_email_in_a_different_capitalization_is_a_duplicate(self):
        self.client.post(self.url, self._payload())

        response = self.client.post(self.url, self._payload(email='Homer@Example.com'))

        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(response.data['code'], 'USER_ALREADY_EXISTS')
        self.assertEqual(User.objects.filter(email__iexact='homer@example.com').count(), 1)

    def test_tc21_database_level_collision_is_also_reported_as_account_already_exists(self):
        # The pre-check compares emails only; an existing account whose *username* equals the new
        # email slips past it and is stopped by the database's unique constraint instead
        # (the same path a simultaneous duplicate submission takes). No mocking involved.
        User.objects.create_user(username='homer@example.com', email='other@example.com', password='Other-Passw0rd!')

        response = self.client.post(self.url, self._payload())

        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(response.data['code'], 'USER_ALREADY_EXISTS')
        self.assertFalse(User.objects.filter(email='homer@example.com').exists())

    def test_tc18_non_english_full_name_stored_exactly_as_entered(self):
        response = self.client.post(self.url, self._payload(full_name='Trương Văn Hòa'))

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['full_name'], 'Trương Văn Hòa')
        self.assertEqual(User.objects.get(email='homer@example.com').full_name, 'Trương Văn Hòa')

    def test_tc20_no_endpoint_exists_to_read_change_or_delete_an_account_by_id(self):
        # Regression for the pre-UM-US-01 `users/<id>/` view, which let any authenticated caller
        # overwrite (with an unhashed password) or delete any account, including the ADMIN's.
        victim = User.objects.create_user(
            username='victim@example.com', email='victim@example.com', password='Victim-Passw0rd!')
        url = f'/api/v1/users/{victim.id}/'
        plain_user = User.objects.create_user(
            username='plain@example.com', email='plain@example.com', password='Plain-Passw0rd!')
        plain_user.roles.add(Role.objects.get(code=Role.Code.USER))

        for caller in (plain_user, self.admin):
            self.client.force_authenticate(caller)
            for method in (self.client.get, self.client.put, self.client.patch, self.client.delete):
                self.assertEqual(method(url).status_code, status.HTTP_404_NOT_FOUND)

        victim.refresh_from_db()
        self.assertTrue(victim.check_password('Victim-Passw0rd!'))
        self.assertTrue(User.objects.filter(pk=victim.pk).exists())

    def test_tc19_failure_part_way_leaves_no_account_behind(self):
        # The failure is induced inside the real test database (no mocking): without the seeded
        # USER role the service fails after the User row was written, so the rollback must remove it.
        Role.objects.filter(code=Role.Code.USER).delete()
        self.client.raise_request_exception = False

        response = self.client.post(self.url, self._payload())

        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertFalse(User.objects.filter(email='homer@example.com').exists())
