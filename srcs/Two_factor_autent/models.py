from django.db import models
from django.contrib.auth.models import User

class UserLoginAttempt(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    attempts = models.PositiveIntegerField(default=0)  # Track failed attempts
    last_failed_attempt = models.DateTimeField(null=True, blank=True)  # Optional: when last failure occurred

    def __str__(self):
        return f"User: {self.user.username}, Attempts: {self.attempts}"