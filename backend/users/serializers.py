from rest_framework import serializers

from . import services
from .models import User


def _messages(required, **extra):
    """Same text for a missing, blank or null value; `extra` adds rule-specific messages."""
    return {'required': required, 'blank': required, 'null': required, **extra}


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(
        max_length=150,
        error_messages=_messages('Full name is required', max_length='Full name must be at most 150 characters'),
    )
    email = serializers.EmailField(
        max_length=150,
        error_messages=_messages('Email is required', invalid='Enter a valid email address',
                                 max_length='Enter a valid email address'),
    )
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        trim_whitespace=False,
        error_messages=_messages('Password is required', min_length='Password must be at least 8 characters'),
    )
    created_at = serializers.DateTimeField(source='date_joined', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'full_name', 'email', 'password', 'is_active', 'created_at']
        read_only_fields = ['id', 'is_active', 'created_at']

    def create(self, validated_data):
        request = self.context.get('request')
        return services.create_user(actor=getattr(request, 'user', None), **validated_data)
