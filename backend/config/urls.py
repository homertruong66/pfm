from django.contrib import admin
from django.urls import path, include

from config.views import health

urlpatterns = [
    path('admin/', admin.site.urls),
    path('health/', health, name='health'),
    path('api/v1/', include('config.api_router')),
]
