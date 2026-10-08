from django.db import models


class Role(models.Model):
    class Code(models.TextChoices):
        # Upper-case values on purpose: these are the literal role names used across SRS/SDS (plan.md D2).
        ADMIN = 'ADMIN', 'Admin'
        USER = 'USER', 'User'

    code = models.CharField(max_length=20, unique=True, choices=Code.choices)

    class Meta:
        db_table = 'roles'

    def __str__(self):
        return self.code
