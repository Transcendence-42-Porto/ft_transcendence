from rest_framework import serializers
from authentication.models import UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'password', 'avatar', 'bio', 'friends']
        extra_kwargs = {'password': {'write_only':True}} #password should be write only

    def create(self, validated_data):
        friends = validated_data.pop('friends', []) #extract the friends field
        user = UserProfile(**validated_data)
        user.set_password(validated_data['password']) #hash the password
        user.save()

        if friends:
            user.friends.set(friends)

        return user
