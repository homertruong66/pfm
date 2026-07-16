from django.urls import path
from . import views

urlpatterns = [
    path('', views.BudgetListCreateView.as_view(), name='budget-list-create'),
    path('<int:pk>/', views.BudgetDetailView.as_view(), name='budget-detail'),
]
