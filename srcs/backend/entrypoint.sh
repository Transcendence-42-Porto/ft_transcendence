#!/bin/bash
#
set -e

# Run database migrations and collect static files
poetry run python manage.py makemigrations
poetry run python manage.py migrate --noinput
poetry run python manage.py collectstatic --noinput

#run the server
poetry run python manage.py runserver 0.0.0.0:8000
