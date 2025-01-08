from django.contrib.auth.forms import authenticate
from rest_framework import serializers
from .models import UserProfile

#Simple logic like fields validation should be located in the serializers.
#Serialize the data posted through the SignUpView
class SignUpSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(max_length=50, allow_blank = False)
    password = serializers.CharField(write_only=True, min_length=8, required=True)

    class Meta:
        model = UserProfile
        fields = ['email', 'username', 'password', 'first_name']

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = UserProfile.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        return user

#Serialize the data posted through the SignInView
class SignInSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=50, allow_blank = False)
    password = serializers.CharField(write_only=True, min_length=8, required=True)

    def validate(self, attrs):
        user = authenticate(email=attrs.get('email'), password=attrs.get('password'))
        if not user:
            error = {'error': 'Unauthorized: Invalid credential'}
            raise serializers.ValidationError(error)
        attrs['user'] = user
        return attrs

#Serializer to display neatly the type of response expected from signin view with swagger-ui
class SignInResponseSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    email = serializers.EmailField()
    refresh = serializers.CharField()
    access = serializers.CharField()
