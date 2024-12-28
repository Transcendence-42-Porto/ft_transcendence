from .serializers				import UserLoginAttemptSerializer
from .models					import UserLoginAttempt
from rest_framework.response	import Response
from django.utils				import timezone
from rest_framework.views		import APIView
from rest_framework				import status
from django.shortcuts			import render
from io							import BytesIO
import qrcode
import pyotp
import time

key = pyotp.random_base32()

def qr_gen(request):
	username = request.data.get("username")
	buffer = BytesIO()
	uri = pyotp.totp.TOTP(key).provisioning_uri(name=username, 
											issuer_name="Transcendence")
	qrcode.make(uri).save(buffer, format="PNG")
	buffer.seek(0)
	return Response({"qrcode": buffer})

def code_ver(request):
	username = request.data.get("username")
	code = request.data.get("code")
	succ_time_dif = timezone.now() - login_attempt.last_failed_attempt

	if (pyotp.totp.verify(code) and succ_time_dif.total_seconds() < 20 ):
		login_attempt.attempts = 0
		login_attempt.last_sucessful_attemp = timezone.now()
		return Response({"Response": "Authentification accepted"}, status=status.HTTP_200_OK)
	
	try:
		login_attempt = UserLoginAttempt.objects.get(user__username=username)
		fail_time_dif = timezone.now() - login_attempt.last_failed_attempt 

		if login_attempt.attempts >= 3 and fail_time_dif.total_seconds() / 60 < 3.0:
			return Response({"Response": "Exceeded attempt limit. Please try again later"}, status=status.HTTP_400_BAD_REQUEST)
		
		login_attempt.attempts += 1
		login_attempt.last_failed_attempt = timezone.now()
		login_attempt.save()

	except UserLoginAttempt.DoesNotExist:
		login_attempt = UserLoginAttempt.objects.create(user=username)
		login_attempt.attempts = 1
		login_attempt.last_failed_attempt = timezone.now()
		login_attempt.save()
		return Response({"Response:" "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)

