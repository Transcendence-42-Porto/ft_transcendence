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
from django.contrib.auth.models import User

class QRGenView(APIView):
	permission_classes = [AllowAny]
	def post(self, request):
		username = request.data.get("username")
		key = pyotp.random_base32()
		try:
			login_attempt = UserLoginAttempt.objects.get(username=username)
			auth_response, is_verified = auth_verif(request)
			# if (not is_verified):
			# 	return (auth_response)
			login_attempt.secret_key = key
			login_attempt.save()
		except:
			UserLoginAttempt.objects.register_user(username, key)
		buffer = BytesIO()
		uri = pyotp.totp.TOTP(key).provisioning_uri(name=username, 
												issuer_name="Transcendence")
		qrcode.make(uri).save(buffer, format="PNG")
		buffer.seek(0)
		qr_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
		return Response({"qrcode": qr_base64})


class QRVerView(APIView):
	permission_classes = [AllowAny]
	def post(self, request):
		username = request.data.get("username")
		code = request.data.get("code")
		login_attempt = UserLoginAttempt.objects.get(username=username)
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
		login.attempts = 0
		login.last_successful_attempt = timezone.now()
		login.save()
		user = User.objects.get(username=login.username)
		#Need to save the secret somewhere in the appplication
		# It is not something unique to the user but unique to the app
		refresh_token = self.gen_refresh_token(user)
		response = self.set_refresh_token_cookie("User sucessfully logged in", refresh_token)
		return response	

	
class token_generation(APIView):
	@staticmethod
	def gen_access_token(user):
		refresh = RefreshToken.for_user(user)
		return str(refresh.access_token)
	
	@staticmethod
	def gen_refresh_token(user):
		refresh = RefreshToken.for_user(user)
		return str(refresh)

	@staticmethod
	def set_refresh_token_cookie(message, refresh_token):
		# Set the refresh token in an HTTPOnly cookie
		access_token = token_generation.gen_access_token(refresh_token.user)
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
			max_age=3600 * 24 * 7,  # Optional: Set expiration time (in seconds)
		)
		return response

	def post(self, request):
		old_token = request.data.get("refresh")
		if old_token is None:
			return Response({'error':'Refresh token is required.'}, status=status.HTTP_400_BAD_REQUEST)
		try:
			refresh_token = self.gen_refresh_token(old_token.user)
			old_token.blacklist() #add the token to the blacklist provided by the jwt library. This list contains all the invalidated tokens.
			response = self.set_refresh_token_cookie("Refresh token sucessfully renewed", refresh_token)
			return response
		except TokenError as e:
			return Response({'error': e.__str__()}, status=status.HTTP_400_BAD_REQUEST)
		except Exception as e:
			return Response({'error': e.__str__()}, status = status.HTTP_400_BAD_REQUEST)