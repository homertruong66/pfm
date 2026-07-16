from rest_framework import serializers
from .models import Transaction


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'wallet', 'category', 'type', 'amount', 'note', 'date', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
