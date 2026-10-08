from rest_framework.generics import CreateAPIView, RetrieveUpdateDestroyAPIView

from config.permissions import IsAdmin

from .models import User
from .serializers import UserSerializer


class UserCreateView(CreateAPIView):
    """UM-US-01: only an ADMIN creates User accounts (no self-service registration, SRS §1.6)."""

    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]


class UserDetailView(RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
