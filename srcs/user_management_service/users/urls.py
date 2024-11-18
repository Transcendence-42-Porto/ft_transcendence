from django.urls import path
# from rest_framework.routers import DefaultRouter
from .views import UserProfileViewSet, getUserView

# # The router is responsible for generating automatically the urls using the viewSet
# router = DefaultRouter()
# router.register(r'api/users', UserProfileViewSet, basename='user')
#
urlpatterns = [
    path('<int:id>/', getUserView.as_view(), name='get-user')
]
