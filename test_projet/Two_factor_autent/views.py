from .serializers				import UserLoginAttemptSerializer
from .models					import UserLoginAttempt
from rest_framework.response	import Response
from django.utils				import timezone
from rest_framework.views		import APIView
from rest_framework				import status
from django.shortcuts			import render
from io							import BytesIO
from django.contrib.auth.models import User
import qrcode
import base64
import pyotp
import time

#---------- Extra for test ------------
from django.http import HttpResponse
from django.template import loader
#--------------------------------------


key = pyotp.random_base32()

class QRGenView(APIView):
	def post(self, request):
		username = request.data.get("username")
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

		try:
			login_attempt = UserLoginAttempt.objects.get(user__username=username)
			succ_time_dif = timezone.now() - login_attempt.last_failed_attempt
			fail_time_dif = timezone.now() - login_attempt.last_failed_attempt 
			print(f"Login attempt details for user {username}:")
			print(f"Attempts: {login_attempt.attempts}")
			print(f"Code introduced: {code}")

			#if login_attempt.attempts >= 3 and fail_time_dif.total_seconds() / 60 < 3.0:
			#	return Response({"Response": "Exceeded attempt limit. Please try again later"}, status=status.HTTP_400_BAD_REQUEST)
			totp = pyotp.TOTP(key)
			if (totp.verify(code) and succ_time_dif.total_seconds() < 20 ):
				login_attempt.attempts = 0
				login_attempt.last_sucessful_attemp = timezone.now()
				return Response({"Response": "Authentification accepted"}, status=status.HTTP_200_OK)
			
			login_attempt.attempts += 1
			login_attempt.last_failed_attempt = timezone.now()
			login_attempt.save()
			return Response({
				    "Response": "Invalid credentials",  # Main message
    				"error_code": "AUTH_INVALID",       # Additional parameter
    				"username": username,               # You can add the username (if needed)
    				"timestamp": timezone.now(),        # Timestamp of the response
					"code introduced was": code,
					"attempt" : f"{login_attempt.attempts} out of 3",
					},
					status=status.HTTP_400_BAD_REQUEST)

		except UserLoginAttempt.DoesNotExist:
			try:
				user = User.objects.get(username=username)
			except:
				user = User.objects.create(username=username)
			login_attempt = UserLoginAttempt.objects.create(user=user)
			login_attempt.attempts = 1
			login_attempt.last_failed_attempt = timezone.now()
			login_attempt.save()
			return Response({"Response:" "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)

def main(request):
  template = loader.get_template('base.html')
  return HttpResponse(template.render())