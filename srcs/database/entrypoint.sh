#!/bin/bash
set -e

# Wait for PostgreSQL to be ready
until pg_isready -U $POSTGRES_USER -d $POSTGRES_DB; do
  echo "Waiting for PostgreSQL to start..."
  sleep 2
done

# Restore the backup file (if it exists)
if [ -f /docker-entrypoint-initdb.d/backup.sql ]; then
  echo "Restoring backup file..."
  psql -U $POSTGRES_USER -d $POSTGRES_DB -f /docker-entrypoint-initdb.d/backup.sql
fi

# Create required roles (if they don't exist)
echo "Creating required roles..."
psql -U $POSTGRES_USER -d $POSTGRES_DB <<-EOSQL
  DO \$$
  BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'v-token-django_u-dWhazJqLCC8bN2s5Jt5y-1741882137') THEN
      CREATE ROLE "v-token-django_u-dWhazJqLCC8bN2s5Jt5y-1741882137";
    END IF;
  END
  \$$;
EOSQL

echo "Database initialization complete!"
