import os
from unittest import mock

from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import TestCase

from users.models import User

from .models import Role


class RoleTests(TestCase):
    """UM-US-01 support: the two fixed roles exist and `createsuperuser` produces an ADMIN."""

    def test_admin_and_user_roles_are_seeded(self):
        self.assertCountEqual(Role.objects.values_list('code', flat=True), ['ADMIN', 'USER'])

    def test_create_superuser_grants_the_admin_role(self):
        admin = User.objects.create_superuser(
            username='root@example.com', email='root@example.com', password='Root-Passw0rd!')

        self.assertTrue(admin.has_role('ADMIN'))
        self.assertFalse(admin.has_role('USER'))

    def test_createsuperuser_command_requires_a_full_name_and_grants_admin(self):
        with mock.patch.dict(os.environ, {'DJANGO_SUPERUSER_PASSWORD': 'Root-Passw0rd!'}):
            with self.assertRaises(CommandError):
                call_command('createsuperuser', interactive=False, username='a@example.com', email='a@example.com')
            call_command('createsuperuser', interactive=False, username='a@example.com',
                         email='a@example.com', full_name='Root Admin')

        admin = User.objects.get(email='a@example.com')
        self.assertEqual(admin.full_name, 'Root Admin')
        self.assertTrue(admin.has_role('ADMIN'))

    def test_plain_user_holds_no_role_until_one_is_assigned(self):
        user = User.objects.create_user(
            username='plain@example.com', email='plain@example.com', password='Plain-Passw0rd!')

        self.assertFalse(user.has_role('ADMIN'))
