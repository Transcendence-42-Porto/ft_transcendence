from django.urls import path
from . import views

urlpatterns = [
    path('qrcode/gen/', views.qr_gen, name='generate_QR'),
    path('qrcode/verify/', views.code_ver, name='verify_code'),
]
