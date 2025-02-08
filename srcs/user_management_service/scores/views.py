from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .serializers import ScoreSerializer
from drf_spectacular.utils import extend_schema

@extend_schema(
    summary="Add score",
    description="Add score to the authenticated user",
    request=ScoreSerializer,
    parameters=None,
    responses={
        201: ScoreSerializer ,
        401: "Authentication credentials were not provided."
    },
)
class AddScoreView(APIView):
    permission_classes = [IsAuthenticated]  # Require the user to be authenticated

    def post(self, request):
        data = request.data
        data['user'] = request.user.id  # Automatically associate the score with the authenticated user
        serializer = ScoreSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

