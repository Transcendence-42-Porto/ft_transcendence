#!/bin/bash

set -e
sleep 7 

echo "Waiting for PostgreSQL to start..."
while ! nc -z $POSTGRES_HOST $POSTGRES_PORT; do
  echo "Waiting for PostgreSQL..."
  sleep 2
done
echo "PostgreSQL is ready!"

echo "Applying migrations..."
retry_count=0
max_retries=5
until poetry run python manage.py migrate --noinput; do
    ((retry_count++))
    if [ $retry_count -ge $max_retries ]; then
        echo "Migration failed after $max_retries attempts. Exiting."
        exit 1
    fi
    echo "Migration failed. Retrying in 5 seconds..."
    sleep 5
done

poetry run python manage.py migrate --fake-initial --noinput


echo "Checking for superuser..."
poetry run python manage.py shell <<END
import os
from django.contrib.auth import get_user_model

User = get_user_model()
username = os.getenv('DJANGO_ROOT_USER', 'admin')
email = os.getenv('DJANGO_ROOT_EMAIL', 'admin@example.com')
password = os.getenv('DJANGO_SUPERUSER_PASSWORD', 'admin123')

if not User.objects.filter(username=username).exists():
    print(f"Creating superuser {username}...")
    User.objects.create_superuser(username=username, email=email, password=password)
else:
    print(f"Superuser {username} already exists.")
END

echo "Starting Django server..."
exec poetry run python manage.py runserver 0.0.0.0:8000
