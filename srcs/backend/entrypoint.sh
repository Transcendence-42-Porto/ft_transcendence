#!/bin/bash
#
set -e

# Run database migrations and collect static files
poetry run python manage.py makemigrations
poetry run python manage.py migrate --noinput
poetry run python manage.py collectstatic --noinput

# Create superuser if not already exists (optional)
poetry run python manage.py shell <<END
from django.contrib.auth import get_user_model
User = get_user_model()
username = '${DJANGO_ROOT_USER}'
email = '${DJANGO_ROOT_EMAIL}'
password = '${DJANGO_SUPERUSER_PASSWORD}'

if not User.objects.filter(username=username).exists():
    print(f"Creating superuser {username}")
    User.objects.create_superuser(username=username, email=email, password=password)
else:
    print(f"Superuser {username} already exists")
END

#run the server
poetry run python manage.py runserver 0.0.0.0:8000
