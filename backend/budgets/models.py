from django.db import models
from django.conf import settings


class Budget(models.Model):
    wallet = models.ForeignKey('wallets.Wallet', on_delete=models.CASCADE, related_name='budgets')
    category = models.ForeignKey('categories.Category', null=True, blank=True, on_delete=models.SET_NULL)
    name = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    period_start = models.DateField()
    period_end = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'budgets'

    def __str__(self):
        return f'{self.name} ({self.wallet})'
