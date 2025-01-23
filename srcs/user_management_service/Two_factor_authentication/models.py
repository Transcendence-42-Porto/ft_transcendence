from django.db import models
from django.utils				import timezone
from django.conf import settings

class UserLoginManager(models.Manager):
    def register_user(self, username, key=None):
        user = self.model(
            username=username,
            secret_key=key,
            last_successful_attempt=timezone.now() - timezone.timedelta(days=365),
            last_failed_attempt=timezone.now() - timezone.timedelta(days=365),
        )
        user.save(using=self._db)
        return user

class UserLoginAttempt(models.Model):
    username = models.CharField(max_length=30, unique=True, null=True)
    attempts = models.PositiveIntegerField(default=0)  # Track failed attempts
    last_failed_attempt = models.DateTimeField(null=True, blank=True)  # Optional: when last failure occurred
    last_successful_attempt = models.DateTimeField(null=True, blank=True)
    secret_key = models.CharField(max_length=32, blank=True, null=True)

    objects = UserLoginManager()

    def __str__(self):
        return f"User: {self.user.username}, Attempts: {self.attempts}, TimeStamp: {self.last_failed_attempt}"
    
    class Meta:
        db_table = "user_login"