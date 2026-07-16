from rest_framework.generics import ListAPIView, RetrieveUpdateAPIView
from .models import Notification
from .serializers import NotificationSerializer


class NotificationListView(ListAPIView):
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)


class NotificationDetailView(RetrieveUpdateAPIView):
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)
