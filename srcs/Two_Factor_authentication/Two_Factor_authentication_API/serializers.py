from rest_framework import serializers
from .models import UserLoginAttempt


class UserLoginAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserLoginAttempt
        fields = ['user', 'attempts', 'last_failed_attempt', 'last_sucessful_attempt']
