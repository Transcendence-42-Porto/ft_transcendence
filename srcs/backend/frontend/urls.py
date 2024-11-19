# backend/urls.py
from django.urls import path
from frontend import views  # O seu view que renderiza a SPA

urlpatterns = [
    path('', views.home_page, name='home'),
    path('login/', views.login, name='login'),
    path('profile/', views.profile, name='profile'),
]
