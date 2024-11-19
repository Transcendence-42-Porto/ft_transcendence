#!/bin/bash

set -e

#run the server
poetry run python manage.py runserver 0.0.0.0:8000
