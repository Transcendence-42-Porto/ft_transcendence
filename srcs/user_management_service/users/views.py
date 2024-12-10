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
from rest_framework.exceptions import PermissionDenied

# Instead of inheriting from ModelViewSet, inherit from GenericBiewSet which restrict 
# the actions and then include only the intersting ones 
class UserProfileViewSet(RetrieveModelMixin, UpdateModelMixin, GenericViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    http_method_names = ['get', 'patch']

    def list(self, request):
        queryset = UserProfile.objects.all()
        serializer = UserProfileSerializer(queryset, many=True)
        return Response(serializer.data)

    # Allow user to modify only their own profile in PATCH method
    def partial_update(self, request, *args, **kwargs):
        user_profile = self.get_object()

        # Ensure only the connected user can modify their profile
        if user_profile != request.user:
            raise PermissionDenied("You are not allowed to edit this profile.")

        # Handle password hashing if 'password' is in the request
        if 'password' in request.data:
            user_profile.set_password(request.data['password'])  # Hash the password
            user_profile.save()
            request.data.pop('password')  # Remove from data to avoid saving it again

        return super().partial_update(request, *args, **kwargs)


    @action(detail=True, methods=['get'], url_path='(?P<field_name>[^/.]+)')
    def retrieve_field(self, request, pk=None, field_name=None):
        """
        Retrieve a specific field of a user profile.
        """
        try:
            user = self.get_object()
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
