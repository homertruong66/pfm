from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from .models import Transaction
from .serializers import TransactionSerializer


class TransactionListCreateView(ListCreateAPIView):
    serializer_class = TransactionSerializer

    def get_queryset(self):
        return Transaction.objects.filter(wallet__user=self.request.user)


class TransactionDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = TransactionSerializer

    def get_queryset(self):
        return Transaction.objects.filter(wallet__user=self.request.user)
