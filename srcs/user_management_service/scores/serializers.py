from rest_framework import serializers
from .models import Score

class ScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Score
        fields = ['id', 'user', 'opponent', 'score', 'date']
        read_only_fields = ['id', 'date']  # `id` and `date` are automatically generated

