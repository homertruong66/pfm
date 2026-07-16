from django.urls import path
from . import views

urlpatterns = [
    path('', views.WalletListCreateView.as_view(), name='wallet-list-create'),
    path('<int:pk>/', views.WalletDetailView.as_view(), name='wallet-detail'),
]
