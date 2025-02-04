from rest_framework import serializers
from authentication.models import UserProfile
from scores.serializers import ScoreSerializer

class UserProfileSerializer(serializers.ModelSerializer):
    scores = ScoreSerializer(many=True, read_only=True)
    friends = serializers.SerializerMethodField()
    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'email', 'password', 'avatar', 'bio', 'friends', 'scores']
        extra_kwargs = {'password': {'write_only':True}} #password should be write only

    def get_friends(self, obj):
        return [{'id': friend.id, 'username': friend.username} for friend in obj.friends.all()]

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
