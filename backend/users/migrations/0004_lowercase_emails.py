from django.db import migrations


def lowercase_emails(apps, schema_editor):
    """Bring existing accounts in line with UM-US-01 EC-10 (emails stored in lower case).

    An account is left untouched if another account already holds its lower-case spelling, so the
    unique constraint can never be violated; `username` follows the email only where it was the same address in another capitalization.
    """
    User = apps.get_model('users', 'User')
    for user in User.objects.all():
        lowered = user.email.lower()
        if lowered == user.email:
            continue
        if User.objects.filter(email=lowered).exclude(pk=user.pk).exists():
            continue
        if user.username.lower() == lowered and not User.objects.filter(username=lowered).exclude(pk=user.pk).exists():
            user.username = lowered
        user.email = lowered
        user.save(update_fields=['email', 'username'])


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0003_require_full_name'),
    ]

    operations = [
        migrations.RunPython(lowercase_emails, migrations.RunPython.noop),
    ]
