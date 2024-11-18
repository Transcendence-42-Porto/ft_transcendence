from rest_framework import viewsets
from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import IsAuthenticated
from .serializers import UserProfileSerializer
from authentication.models import UserProfile
from drf_spectacular.utils import extend_schema, OpenApiParameter


class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer

@extend_schema(
    summary="Get Users",
    description="Get users by id",
    parameters=[
        OpenApiParameter(
            name='Authorization',
            description='Bearer JWT token',
            required=True,
            type=str,
            location=OpenApiParameter.HEADER
        )
    ],
    responses={
        200: UserProfileSerializer,
        401: {'description': 'Unauthorized: Invalid credentials.'},
    },
)
class getUserView(RetrieveAPIView):
    queryset = UserProfile.objects.all()
    permission_classes = [IsAuthenticated]
    serializer_class = UserProfileSerializer
    lookup_field = 'id'
