from django.db import models
from django.conf import settings


class Wallet(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wallets')
    name = models.CharField(max_length=100)
    balance = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default='USD')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'wallets'

    def __str__(self):
        return f'{self.name} ({self.user})'
