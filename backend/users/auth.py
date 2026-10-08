import logging

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

logger = logging.getLogger(__name__)


class LoginSerializer(TokenObtainPairSerializer):
    """Stock SimpleJWT login plus the success log line constitution § Logging & Audit asks for.

    A failed attempt (wrong credentials, deactivated account, missing field) is logged at WARN by
    `config.exceptions.api_exception_handler`. Neither line contains the email or the password.
    """

    def validate(self, attrs):
        data = super().validate(attrs)
        logger.info('login succeeded: user_id=%s', self.user.id)
        return data


class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer
