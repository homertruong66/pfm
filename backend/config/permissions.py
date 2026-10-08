from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """Allows only an authenticated User that holds the ADMIN role (SRS §1.5, AC-02).

    An unauthenticated caller gets 401 (JWT authentication supplies the challenge header);
    an authenticated caller without the ADMIN role gets 403.
    """

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.has_role('ADMIN'))
