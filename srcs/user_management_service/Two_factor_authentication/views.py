from .models					import UserLoginAttempt
from rest_framework.response	import Response
from django.utils				import timezone
from rest_framework.views		import APIView
from rest_framework				import status
from io							import BytesIO
from .JWTmiddleware				import auth_verif
import qrcode
import base64
import pyotp
import jwt
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth import get_user_model

class QRGenView(APIView):
	permission_classes = [AllowAny]
	def post(self, request):
		user_email = request.data.get("email")
		key = pyotp.random_base32()
		# try:
		# 	login_attempt = UserLoginAttempt.objects.get(email=user_email)
		# 	auth_response, is_verified = auth_verif(request)
		# 	# if (not is_verified):
		# 	# 	return (auth_response)
		# 	login_attempt.secret_key = key
		# 	login_attempt.save()
		# except:
		UserLoginAttempt.objects.register_user(user_email, key)
		buffer = BytesIO()
		uri = pyotp.totp.TOTP(key).provisioning_uri(name=user_email, 
												issuer_name="Transcendence")
		qrcode.make(uri).save(buffer, format="PNG")
		buffer.seek(0)
		qr_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
		return Response({"qrcode": qr_base64})


class QRVerView(APIView):
	permission_classes = [AllowAny]
	def post(self, request):
		user_email = request.data.get("email")
		code = request.data.get("code")
		login_attempt = UserLoginAttempt.objects.get(email=user_email)
		succ_time_dif = timezone.now() - login_attempt.last_successful_attempt
		fail_time_dif = timezone.now() - login_attempt.last_failed_attempt 
		key = login_attempt.secret_key
		totp = pyotp.TOTP(key)
		
		if (login_attempt.attempts % 3 == 0 and login_attempt.attempts != 0
	  		and fail_time_dif.total_seconds() / 60 < 3.0 * login_attempt.attempts / 3):
				return Response({"error": "Exceeded attempt limit. Please try again later"},
					 status=status.HTTP_400_BAD_REQUEST)
		
		if (totp.verify(code) and succ_time_dif.total_seconds() > 20):
			return (self.success_attempt(login_attempt))
		else:
			return (self.failed_attempt(login_attempt))
	

	def failed_attempt (self, login):
		login.attempts += 1
		login.last_failed_attempt = timezone.now()
		login.save()
		return Response({"error": "Invalid credentials"},
					status=status.HTTP_400_BAD_REQUEST)

	def success_attempt (self, login):
		User = get_user_model()
		login.attempts = 0
		login.last_successful_attempt = timezone.now()
		login.save()
		user = User.objects.get(email=login.email)
		refresh_token = token_generation.gen_refresh_token(user)
		response = token_generation.set_refresh_token_cookie("User sucessfully logged in", refresh_token)
		return response

class token_generation(APIView):
	@staticmethod
	def gen_access_token(refresh_token):
		return str(refresh_token.access_token)
	
	@staticmethod
	def gen_refresh_token(user):
		refresh = RefreshToken.for_user(user)
		return refresh

	@staticmethod
	def set_refresh_token_cookie(message, refresh_token):
		# Set the refresh token in an HTTPOnly cookie
		access_token = token_generation.gen_access_token(refresh_token)
		response = Response({
            "access_token": access_token,
            "message": message
        	})
		response.set_cookie(
			key='refresh_token',
			value=str(refresh_token),
			httponly=True,  # Prevent access from JavaScript
			secure=True,    # Send only over HTTPS
			samesite='Strict',  # Prevent CSRF attacks by limiting cross-site requests
			max_age=3600 * 24 * 7,  # Expiration time = 7 days
		)
		return response

	permission_classes = [AllowAny]
	def get(self, request):
		refresh_token = request.COOKIES.get('refresh_token')
		if refresh_token is None:
			return Response({'error':'Refresh token is required.'}, status=status.HTTP_400_BAD_REQUEST)
		try:
			#refresh_token = self.gen_refresh_token(old_token.user)
			#old_token.blacklist() # Add the token to the blacklist provided by the jwt library. This list contains all the invalidated tokens.
			#response = self.set_refresh_token_cookie("Refresh token sucessfully renewed", refresh_token)
			access_token = token_generation.gen_access_token(refresh_token)
			response = Response({
            	"access_token": access_token,
            	"message": "Access token sucessfully renewed"
        		})
			return response
		except TokenError as e:
			return Response({'error': e.__str__()}, status=status.HTTP_400_BAD_REQUEST)
		except Exception as e:
			return Response({'error': e.__str__()}, status = status.HTTP_400_BAD_REQUEST)