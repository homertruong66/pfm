from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    # Auth
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # Domain apps
    path('users/', include('users.urls')),
    path('wallets/', include('wallets.urls')),
    path('categories/', include('categories.urls')),
    path('budgets/', include('budgets.urls')),
    path('transactions/', include('transactions.urls')),
    path('notifications/', include('notifications.urls')),
]
