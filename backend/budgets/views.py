from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from .models import Budget
from .serializers import BudgetSerializer


class BudgetListCreateView(ListCreateAPIView):
    serializer_class = BudgetSerializer

    def get_queryset(self):
        return Budget.objects.filter(wallet__user=self.request.user)


class BudgetDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = BudgetSerializer

    def get_queryset(self):
        return Budget.objects.filter(wallet__user=self.request.user)
