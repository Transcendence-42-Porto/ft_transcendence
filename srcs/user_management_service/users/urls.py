from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserProfileViewSet, AddFriendView, DeleteFriendView, UploadImageView

# # The router is responsible for generating automatically the urls using the viewSet
router = DefaultRouter()
router.register('', UserProfileViewSet, basename='user')

urlpatterns = [
    path('', include(router.urls)),
    path('add-friends', AddFriendView.as_view(), name='add-firend'),
    path('remove-friends', DeleteFriendView.as_view(), name='remove-friend'),
    path('upload-image', UploadImageView.as_view(), name='upload_image'),
]
