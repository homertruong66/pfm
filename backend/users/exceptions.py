from rest_framework.exceptions import APIException


class UserAlreadyExists(APIException):
    """409 — an account with this email already exists (SDS §6.6, API-03)."""

    status_code = 409
    default_code = 'USER_ALREADY_EXISTS'
    default_detail = {'detail': 'Account already exists', 'code': 'USER_ALREADY_EXISTS'}
