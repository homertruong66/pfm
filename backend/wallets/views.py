from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from .models import Wallet
from .serializers import WalletSerializer


class WalletListCreateView(ListCreateAPIView):
    serializer_class = WalletSerializer

    def get_queryset(self):
        return Wallet.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class WalletDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = WalletSerializer

    def get_queryset(self):
        return Wallet.objects.filter(user=self.request.user)
