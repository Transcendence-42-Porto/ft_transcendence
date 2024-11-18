# Description: Dockerfile for the backend service
FROM python:3.11.4-slim-bullseye

ARG DJANGO_ROOT_PASSWORD

# set work directory
WORKDIR /app
# set environment variables
# Prevents Python from writing pyc
ENV PYTHONDONTWRITEBYTECODE 1

# Prevents Python from buffering stdout and stderr
ENV PYTHONUNBUFFERED 1

ENV DJANGO_SUPERUSER_PASSWORD ${DJANGO_ROOT_PASSWORD}

# install dependencies
RUN pip install poetry

# Copy dependency files to install dependencies
COPY pyproject.toml poetry.lock* /app/

# Install only the dependencies
RUN poetry install --no-root --only main

# Copy the current directory contents into the container at /app
COPY . /app

# Expose the port the app runs on
EXPOSE 8000

# Add this line after copying your application files
COPY entrypoint.sh /app/

# Make the entrypoint script executable
RUN chmod +x entrypoint.sh

# Run database migrations before starting the server
ENTRYPOINT ["bash", "-c", "./entrypoint.sh"]
