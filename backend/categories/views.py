from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from .models import Category
from .serializers import CategorySerializer


class CategoryListCreateView(ListCreateAPIView):
    serializer_class = CategorySerializer

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class CategoryDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = CategorySerializer

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)
