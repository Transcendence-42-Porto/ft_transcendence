from rest_framework import serializers
from .models import Score

class ScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Score
        fields = ['id', 'user', 'opponent', 'user_score', 'opponent_score', 'date', 'game_type', 'tournament_name'] #TODO: add new fields from scores
        read_only_fields = ['id', 'date']  # `id` and `date` are automatically generated

