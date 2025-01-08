from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from .serializers import SignInSerializer, SignUpSerializer, SignInResponseSerializer
from .models import UserProfile
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from drf_spectacular.utils import extend_schema, OpenApiParameter

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

    data = serializer.validated_data
    response_data = {
    'email': str(data['user'].email),
    }
    response_data["id"] = str(data['user'].id)

    # Generate tokens for the authenticated user
    refresh = RefreshToken.for_user(data["user"])
    response_data["refresh"] = str(refresh)
    response_data["access"] = str(refresh.access_token)

    return Response(response_data, status=status.HTTP_200_OK)


@extend_schema(
    summary="Sign Out",
    description="Sign-out a user using the access token specifyied in the headers.",
    parameters=[   OpenApiParameter(name='Authorization', description='Authorization token', required=True, type=str, location=OpenApiParameter.HEADER)],
    responses={
        200: {'description': 'Succefuly logged out!'},
        400: {'description': 'Authentication credentials were not provided.'},
    },
)
@api_view(['POST'])
def signout_view(request):
    refresh_token = request.data.get("refresh")

    if refresh_token is None:
        return Response({'error':'Refresh token is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        token = RefreshToken(refresh_token)
        token.blacklist() #add the token to the blacklist provided by the jwt library. This list contains all the invalidated tokens.
        return Response({'success' : 'Succefully logged out!'}, status=status.HTTP_200_OK)
    except TokenError as e:
        return Response({'error': e.__str__()}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': e.__str__()}, status = status.HTTP_400_BAD_REQUEST)


