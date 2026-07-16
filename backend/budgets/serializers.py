from rest_framework import serializers
from .models import Budget


class BudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Budget
        fields = ['id', 'wallet', 'category', 'name', 'amount', 'period_start', 'period_end', 'created_at']
        read_only_fields = ['id', 'created_at']
