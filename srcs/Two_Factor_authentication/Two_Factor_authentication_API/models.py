from django.db import models
from django.contrib.auth.models import User
from django.contrib.auth.models import AbstractUser

class UserLoginAttempt(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    attempts = models.PositiveIntegerField(default=0)  # Track failed attempts
    last_failed_attempt = models.DateTimeField(null=True, blank=True)  # Optional: when last failure occurred
    last_successful_attempt = models.DateTimeField(null=True, blank=True)
    secret_key = models.CharField(max_length=32, blank=True, null=True)

    def __str__(self):
        return f"User: {self.user.username}, Attempts: {self.attempts}, TimeStamp: {self.last_failed_attempt}"
    