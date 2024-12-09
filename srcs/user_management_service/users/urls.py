from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserProfileViewSet, getUserView

# # The router is responsible for generating automatically the urls using the viewSet
router = DefaultRouter()
router.register('', UserProfileViewSet, basename='user')

urlpatterns = [
    path('', include(router.urls))
]
