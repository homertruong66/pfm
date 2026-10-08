from django.db import migrations

ROLE_CODES = ['ADMIN', 'USER']


def seed_roles(apps, schema_editor):
    Role = apps.get_model('roles', 'Role')
    for code in ROLE_CODES:
        Role.objects.get_or_create(code=code)


def unseed_roles(apps, schema_editor):
    Role = apps.get_model('roles', 'Role')
    Role.objects.filter(code__in=ROLE_CODES).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('roles', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_roles, unseed_roles),
    ]
