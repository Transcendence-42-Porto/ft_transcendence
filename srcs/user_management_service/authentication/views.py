from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from .serializers import SignInSerializer, SignUpSerializer, SignInResponseSerializer, SignOutSerializer
from .models import UserProfile
from rest_framework_simplejwt.tokens import RefreshToken
from drf_spectacular.utils import extend_schema

# Your existing code
@extend_schema(
    summary="Sign Up",
    description="Create a user using info passed in the request body.",
    request=SignUpSerializer,
    parameters=None,
    responses={
        201: SignUpSerializer,
        409: {'description': 'Conflict: Email or username already exists.'},
    },
)
@api_view(['POST'])
@permission_classes([AllowAny])
def signup_view(request):
    email = request.data.get("email", None)
    username = request.data.get("username", None)

    # Check if email or username already exists
    if UserProfile.objects.filter(email=email).exists():
        res_message = {"error": {"Email already exists"}}
        return Response(res_message, status=status.HTTP_409_CONFLICT)
    if UserProfile.objects.filter(username=username).exists():
        res_message = {"error": {"Username already exists"}}
        return Response(res_message, status=status.HTTP_409_CONFLICT)

    # Serialize and save the new user
    serializer = SignUpSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save()

    return Response(serializer.data, status=status.HTTP_201_CREATED)


@extend_schema(
    summary="Sign In",
    description="Sign-in a user using the email and password passed in the request body. Returns user info and tokens.",
    request=SignInSerializer,
    responses={
        200: SignInResponseSerializer,
        401: {'description': 'Unauthorized: Invalid credentials.'},
        409: {'description': 'Conflict: Email or username already exists.'},
    },
)
@api_view(['POST'])
@permission_classes([AllowAny])
def signin_view(request):
    serializer = SignInSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)

    user = serializer.validated_data["user"]

    # Set user online
    user.is_online = True
    user.save(update_fields=["is_online"])

    # Generate tokens
    refresh = RefreshToken.for_user(user)

    response_data = {
        "id": user.id,
        "email": user.email,
        "is_online": user.is_online,
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }

    return Response(response_data, status=status.HTTP_200_OK)

@extend_schema(
    summary="Sign Out",
    description="Sign-out a user using the refresh token provided in the request body.",
    request=SignOutSerializer,
    responses={
        200: {'description': 'Successfully logged out!'},
        400: {'description': 'Bad request: Invalid or missing refresh token.'},
    },
)
@api_view(['POST'])
def signout_view(request):
    serializer = SignOutSerializer(data=request.data)

    if serializer.is_valid():
        user = request.user
        user.is_online = False
        user.save(update_fields=["is_online"])
        return Response({"success": "Successfully logged out!"}, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

