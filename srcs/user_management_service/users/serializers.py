from rest_framework import serializers
from authentication.models import UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'email', 'password', 'avatar', 'bio', 'friends']
        extra_kwargs = {'password': {'write_only':True}} #password should be write only


    def create(self, validated_data):
        friends = validated_data.pop('friends', []) #extract the friends field
        user = UserProfile(**validated_data)
        user.set_password(validated_data['password']) #hash the password
        user.save()

        if friends:
            user.friends.set(friends)

        return user
    
    # For PATCH method
    def update(self, instance, validated_data):
        # Check if 'password' is in the validated data
        password = validated_data.pop('password', None)
        if password:
            instance.set_password(password)  # Hash the password
        return super().update(instance, validated_data)
