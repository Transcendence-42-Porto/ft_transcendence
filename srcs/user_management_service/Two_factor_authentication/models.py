from django.db import models
from django.utils				import timezone
from django.conf import settings

class UserLoginManager(models.Manager):
    def register_user(self, user_email, key=None):
        user = self.model(
            email=user_email,
            secret_key=key,
            attempts=0,
            last_successful_attempt=timezone.now() - timezone.timedelta(days=365),
            last_failed_attempt=timezone.now() - timezone.timedelta(days=365),
        )
        user.save()
        return user

class UserLoginAttempt(models.Model):
    email = models.EmailField(unique=True, null=True)
    attempts = models.PositiveIntegerField(default=0)  # Track failed attempts
    last_failed_attempt = models.DateTimeField(null=True, blank=True)  # Optional: when last failure occurred
    last_successful_attempt = models.DateTimeField(null=True, blank=True)
    secret_key = models.CharField(max_length=32, blank=True, null=True)

    objects = UserLoginManager()

    class Meta:
        db_table = "user_login"