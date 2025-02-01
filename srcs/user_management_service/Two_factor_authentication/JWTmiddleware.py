import jwt
import re
from django.conf import settings
from django.http import JsonResponse

def auth_verif(request):
    # Extract token from the 'Authorization' header
    auth_header = request.headers.get('Authorization', None)
    if not auth_header:
        return JsonResponse({'error': 'Authorization header missing'}, status=401), False
    try:
        # Expect the format: "Bearer <token>"
        prefix, token = auth_header.split(" ")
        if prefix.lower() != "bearer":
            return JsonResponse({'error': 'Invalid Authorization header format'}, status=401), False

        # Decode and verify the JWT
        #Need to save the secret somewhere in the appplication
        # It is not something unique to the user but unique to the app
        payload = jwt.decode(token, 'secret', algorithms=["HS256"])

        # Attach the payload or user info to the request
        request.user = payload
        return None, True

    except jwt.ExpiredSignatureError:
        return JsonResponse({'error': 'Token has expired'}, status=401), False
    except jwt.InvalidTokenError:
        return JsonResponse({'error': 'Invalid token'}, status=401), False
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400), False

class JWTAuthenticationMiddleware:
    """
    Middleware to verify JWT tokens and attach the payload to the request object.

     ====> Implement a refresh token mechanism to keep 
     the user logged in for longer periods.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # For example in url that necessarily need the JWT
        #  include auth in the path
        include_patterns = [r'^/qrcash/verify/']#[r'^/qrcode/verify/']
        # Skip token verification for the token and refresh token endpoints
        for pattern in include_patterns:
            if not re.match(pattern, request.path):
                return self.get_response(request)

        auth_response, is_verified = auth_verif(request)
        if (not is_verified):
            return (auth_response)

        # Continue processing the request
        response = self.get_response(request)
        return response