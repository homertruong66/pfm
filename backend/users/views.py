from rest_framework.generics import CreateAPIView

from config.permissions import IsAdmin

from .models import User
from .serializers import UserSerializer


class UserCreateView(CreateAPIView):
    """UM-US-01: only an ADMIN creates User accounts (no self-service registration, SRS §1.6).

    There is deliberately no detail view (`users/<id>/`): reading, updating, deactivating and
    deleting accounts are UM-US-02..06 and each adds its own, permission-checked endpoint.
    """

    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
