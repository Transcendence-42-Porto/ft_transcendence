from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import UserProfile

@admin.register(UserProfile)
class CustomUserAdmin(UserAdmin):
    model = UserProfile
    list_display = ('username', 'email', 'is_staff', 'is_superuser')
    # Add other admin configuration if needed

    #skip log deletion to avoid foreign key issue. when deleting a user_profile, django default logging was trying to remove the corresponding auth_user
    def log_deletions(self, request, queryset):
        # Prevent logging deletions to django_admin_log
        for obj in queryset:
            print(f"UserProfile deleted: {obj.username} (ID: {obj.id})")

    # Override to prevent logging changes for user profiles (same as above)
    def log_change(self, request, obj, message):
        # Prevent logging to django_admin_log
        print(f"UserProfile changed: {obj.username} (ID: {obj.id})")
