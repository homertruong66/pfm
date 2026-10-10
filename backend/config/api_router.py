from django.urls import path, include

urlpatterns = [
    # Domain apps
    path('users/', include('users.urls')),
    path('wallets/', include('wallets.urls')),
    path('categories/', include('categories.urls')),
    path('budgets/', include('budgets.urls')),
    path('transactions/', include('transactions.urls')),
    path('notifications/', include('notifications.urls')),
]
