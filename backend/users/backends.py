from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend


class EmailBackend(ModelBackend):
    """Authenticate by email, ignoring capitalization (SS-US-01 EC-04).

    Django's stock `ModelBackend` matches the login field exactly, so an account created as
    `Homer@Example.com` could only log in with that spelling. Account creation already treats emails
    that differ only in capitalization as the same account (UM-US-01 EC-07), so at most one account
    can match; if legacy data ever produced two, neither can log in rather than guessing.
    """

    def authenticate(self, request, username=None, password=None, **kwargs):
        User = get_user_model()
        email = kwargs.get(User.USERNAME_FIELD, username)
        if email is None or password is None:
            return None
        try:
            user = User.objects.get(email__iexact=email)
        except (User.DoesNotExist, User.MultipleObjectsReturned):
            User().set_password(password)  # keep timing similar to a real password check
            return None
        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None
