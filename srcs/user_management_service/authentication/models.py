from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone

class UserProfileManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have superuser=True.")

        return self.create_user(username, email, password=password, **extra_fields)


class UserProfile(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=30, unique=True, null=True)
    email = models.EmailField(unique=True, null=True)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    password = models.CharField(max_length=100, blank=True, null=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False) 
    is_active = models.BooleanField(default=True) 
    bio = models.TextField(blank=True, null=True)
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)
    friends = models.ManyToManyField("self", blank=True)
    date_joined = models.DateTimeField(default=timezone.now) 

    # Define a manager
    objects = UserProfileManager()

    USERNAME_FIELD = 'email'  # Email as the unique identifier for login
    REQUIRED_FIELDS = ['username']  # Fields that are required for createsuperuser

    def __str__(self):
        return self.username or 'Unknown User'

    class Meta:
        db_table = "user_profiles"
