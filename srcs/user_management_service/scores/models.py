from django.db import models
from authentication.models import UserProfile

class Score(models.Model):
    user = models.ForeignKey(
        UserProfile, 
        on_delete=models.CASCADE, 
        related_name="scores"  # Allows easy access to all scores of a user
    )
    opponent = models.CharField(max_length=255)
    score = models.IntegerField()
    date = models.DateTimeField(auto_now_add=True)  # Automatically sets the date when the score is created

    def __str__(self):
        return f"{self.user.username} vs {self.opponent}: {self.score} on {self.date}"

