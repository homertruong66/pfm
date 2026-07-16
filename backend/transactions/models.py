from django.db import models


class TransactionType(models.TextChoices):
    INCOME = 'income', 'Income'
    EXPENSE = 'expense', 'Expense'


class Transaction(models.Model):
    wallet = models.ForeignKey('wallets.Wallet', on_delete=models.CASCADE, related_name='transactions')
    category = models.ForeignKey('categories.Category', null=True, blank=True, on_delete=models.SET_NULL)
    type = models.CharField(max_length=10, choices=TransactionType.choices)
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    note = models.TextField(blank=True)
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'transactions'
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f'{self.type} {self.amount} ({self.wallet})'
