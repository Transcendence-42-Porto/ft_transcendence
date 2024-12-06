from django.core.serializers.json import Serializer
from django.db.models import manager
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import IsAuthenticated
from .serializers import UserProfileSerializer
from authentication.models import UserProfile
from drf_spectacular.utils import extend_schema, OpenApiParameter
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet
from rest_framework.mixins import RetrieveModelMixin, UpdateModelMixin

# Instead of inheriting from ModelViewSet, inherit from GenericBiewSet which restrict 
# the actions and then include only the intersting ones 
class UserProfileViewSet(RetrieveModelMixin, UpdateModelMixin, GenericViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer

    def list(self, request):
        queryset = UserProfile.objects.all()
        serializer = UserProfileSerializer(queryset, many=True)
        return Response(serializer.data)

    # Allow user to modify only their own profile
    def get_queryset(self):
        if self.action == 'update':
            return UserProfile.objects.filter(id=self.request.user.id)
        return super().get_queryset()

    # Retriev only specific fields of the user profile
    @action(detail=True, methods=['get'], url_path='field/(?P<field_name>[^/.]+)')
    def retrieve_field(self, request, pk=None, field_name=None):
        """
        Retrieve a specific field of a user profile.
        """
        try:
            user = self.get_object()  # Retrieve the user object by pk
            # Validate that the field exists in the model
            model_fields = [field.name for field in UserProfile._meta.get_fields()]
            if field_name not in model_fields:
                return Response(
                    {"detail": f"Field '{field_name}' not found in the UserProfile model."},
                    status=400
                )
            # If the field exists, return its value
            return Response({field_name: getattr(user, field_name)})
        except Exception as e:
            return Response({"detail": f"An error occurred: {str(e)}"}, status=500)

   
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
