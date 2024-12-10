from django.urls import path
from .views import  signin_view, signup_view, signout_view
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('sign-up', signup_view, name = 'sign-up'),
    path('sign-in', signin_view, name ='sign-in'),
    path('sign-out', signout_view, name = 'sign-out'),
    path('token-refresh', TokenRefreshView.as_view(), name='token_refresh'),
]
