from django.contrib.auth.models import AbstractUser, UserManager as DjangoUserManager
from django.db import models


class UserManager(DjangoUserManager):
    def create_superuser(self, username, email=None, password=None, **extra_fields):
        """`createsuperuser` is how the first ADMIN comes into existence (RUNBOOK §9), so it
        also grants the ADMIN role — the app authorizes by Role, not by Django's staff flags."""
        from roles.models import Role

        user = super().create_superuser(username, email, password, **extra_fields)
        admin_role, _ = Role.objects.get_or_create(code=Role.Code.ADMIN)
        user.roles.add(admin_role)
        return user


class User(AbstractUser):
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=150, blank=True, default='')
    roles = models.ManyToManyField('roles.Role', related_name='users', db_table='user_roles', blank=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        db_table = 'users'

    def has_role(self, code):
        return self.roles.filter(code=code).exists()
