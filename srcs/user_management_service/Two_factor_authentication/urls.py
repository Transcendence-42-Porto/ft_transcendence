from django.urls import path
from . import views
from .views import QRGenView, QRVerView

urlpatterns = [
    path('gen/', QRGenView.as_view(), name='generate_QR'),
    path('verify/', QRVerView.as_view(), name='verify_code'),
]

