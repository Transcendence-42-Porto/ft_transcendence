from .serializers				import UserLoginAttemptSerializer
from .models					import UserLoginAttempt
from rest_framework.response	import Response
from django.utils				import timezone
from rest_framework.views		import APIView
from rest_framework				import status
from io							import BytesIO
from django.contrib.auth.models import User
from .JWTmiddleware				import auth_verif
import qrcode
import base64
import pyotp
import jwt

#---------- Extra for test ------------
from django.http import HttpResponse
from django.template import loader
#--------------------------------------

class QRGenView(APIView):
	def post(self, request):
		username = request.data.get("username")
		key = pyotp.random_base32()
		# ---- Extra logic for testing purposes ---- 
		try:
			user = User.objects.get(username=username)
		except:
			user = User.objects.create(username=username)
			user.save()
		# ------------------------------------------
		try:
			login_attempt = UserLoginAttempt.objects.get(user=user)
			auth_response, is_verified = auth_verif(request)
			if (not is_verified):
				return (auth_response)
		except:
			login_attempt = UserLoginAttempt.objects.create(user=user)
			login_attempt.last_successful_attempt = timezone.now() - timezone.timedelta(days=365)  # Arbitrarily set to a long time ago
			login_attempt.last_failed_attempt = timezone.now() - timezone.timedelta(days=365)  # Same for fail_time_dif
		login_attempt.secret_key = key
		login_attempt.save()
		buffer = BytesIO()
		uri = pyotp.totp.TOTP(key).provisioning_uri(name=username, 
												issuer_name="Transcendence")
		qrcode.make(uri).save(buffer, format="PNG")
		buffer.seek(0)
		qr_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
		return Response({"qrcode": qr_base64})

class QRVerView(APIView):
	def post(self, request):
		username = request.data.get("username")
		code = request.data.get("code")
		login_attempt = UserLoginAttempt.objects.get(user__username=username)
		succ_time_dif = timezone.now() - login_attempt.last_successful_attempt
		fail_time_dif = timezone.now() - login_attempt.last_failed_attempt 

		key = login_attempt.secret_key
		totp = pyotp.TOTP(key)
		if (login_attempt.attempts % 3 == 0 and login_attempt.attempts != 0
	  		and fail_time_dif.total_seconds() / 60 < 3.0 * login_attempt.attempts / 3):
				return Response({"Response": "Exceeded attempt limit. Please try again later"},
					 status=status.HTTP_400_BAD_REQUEST)

		if (totp.verify(code) and succ_time_dif.total_seconds() > 20):
			return (self.success_attempt(login_attempt))
		else:
			return (self.failed_attempt(login_attempt))
	

	def failed_attempt (self, login):
		login.attempts += 1
		login.last_failed_attempt = timezone.now()
		login.save()
		return Response({
				"Response": "Invalid credentials",  # Main message
				"username": login.user.username,
				"timestamp": timezone.now(),        # Timestamp of the response
				"attempt" : f"{login.attempts}",
				},
					status=status.HTTP_400_BAD_REQUEST)


	def success_attempt (self, login):
		login.attempts = 0
		login.last_successful_attempt = timezone.now()
		login.save()
		payload = {
			"id": login.user.id,
			"username": login.user.username,
			"iat": login.last_successful_attempt
		}
		#Need to save the secret somewhere in the appplication
		# It is not something unique to the user but unique to the app
		token = jwt.encode(payload, 'secret', algorithm="HS256")#.decode('utf-8')
		response = Response()
		response.set_cookie(key='Authorization', value=token, httponly=True)
		response.data = {"Authorization": token}
		return (response)


def main(request):
  template = loader.get_template('base.html')
  return HttpResponse(template.render())