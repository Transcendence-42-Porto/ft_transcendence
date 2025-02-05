from django.core.serializers.json import Serializer
from django.db.models import manager
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import IsAuthenticated
from .serializers import UserProfileSerializer
from authentication.models import UserProfile
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample, OpenApiResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet
from rest_framework.mixins import RetrieveModelMixin, UpdateModelMixin
from rest_framework.exceptions import PermissionDenied
from scores.serializers import ScoreSerializer
from rest_framework import status


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

    # @extend_schema(
    #     request={
    #         'multipart/form-data': {
    #             'type': 'object',
    #             'properties': {
    #                 'avatar': {
    #                     'type': 'string',
    #                     'format': 'binary'  # Proper OpenAPI file format
    #                 }
    #             }
    #         }
    #     },
    #     responses={200: UserProfileSerializer}
    # )
    def partial_update(self, request, *args, **kwargs):
        user_profile = self.get_object()

        # Ensure only the connected user can modify their profile
        if user_profile != request.user:
            raise PermissionDenied("You are not allowed to edit this profile.")
        
        # Handle avatar file upload
        if 'avatar' in request.FILES:
            user_profile.avatar = request.FILES['avatar']

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
            #special handling for scores and friends
            if field_name == 'scores':
                serializer = ScoreSerializer(user.scores.all(), many=True)
                return Response({field_name: serializer.data})
            # Special handling for friends
            if field_name == 'friends':
                friends = user.friends.all()
                friends_data = [{'id': friend.id, 'username': friend.username} for friend in friends]
                return Response({field_name: friends_data})

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
    summary="Add Friend",
    description="Add a user to the current user's friend list",
    request={
        'application/json': {
            'type': 'object',
            'properties': {
                'username': {
                    'type': 'string',
                    'description': 'User name of the user to add as friend'
                }
            },
            'required': ['username']
        }
    },
    responses={
        200: OpenApiResponse(
            description="Friend added successfully",
            response={
                'type': 'object',
                'properties': {
                    'detail': {
                        'type': 'string',
                        'example': 'Friend added successfully'
                    },
                    'friend': {
                        'type': 'object',
                        'properties': {
                            'id': {'type': 'integer', 'example': 1},
                            'username': {'type': 'string', 'example': 'frienduser'}
                        }
                    }
                }
            }
        ),
        400: OpenApiResponse(
            description="Bad request",
            response={
                'type': 'object',
                'properties': {
                    'detail': {
                        'type': 'string',
                        'example': 'username is required'
                    }
                }
            }
        ),
        404: OpenApiResponse(
            description="User not found",
            response={
                'type': 'object',
                'properties': {
                    'detail': {
                        'type': 'string',
                        'example': 'User not found'
                    }
                }
            }
        ),
        500: OpenApiResponse(
            description="Internal server error",
            response={
                'type': 'object',
                'properties': {
                    'detail': {
                        'type': 'string',
                        'example': 'An error occurred'
                    }
                }
            }
        )
    }
)
class AddFriendView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        """
        Add a friend to the user's friend list.
        Expects a username in the request data.
        """
        try:
            # Get the current user's profile
            user_profile = request.user

            # Get the username from request data
            username = request.data.get('username')
            if not username:
                return Response(
                    {"detail": "username is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Validate friend exists
            try:
                friend = UserProfile.objects.get(username=username)
            except UserProfile.DoesNotExist:
                return Response(
                    {"detail": "User not found"},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Check if user is trying to add themselves
            if user_profile.username == friend.username:
                return Response(
                    {"detail": "You cannot add yourself as a friend"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Chec  )k if already friends
            if friend in user_profile.friends.all():
                return Response(
                    {"detail": "Already friends with this user"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Add friend
            user_profile.friends.add(friend)

            return Response({
                "detail": "Friend added successfully",
                "friend": {
                    "id": friend.id,
                    "username": friend.username
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"detail": f"An error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
