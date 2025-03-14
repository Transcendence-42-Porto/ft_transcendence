#!/bin/sh

# Start Vault in the background
vault server -dev -dev-listen-address="0.0.0.0:8200" -dev-root-token-id=${VAULT_TOKEN} &
VAULT_PID=$!

# Wait for Vault to become ready
echo "🔐 Waiting for Vault to start..."
until curl -s ${VAULT_ADDR}/v1/sys/health | grep -q '"initialized":true'; do
  sleep 2
done
echo "✅ Vault is ready!"

# Login to Vault
vault login ${VAULT_TOKEN}

# Enable the database secrets engine
vault secrets enable database

# Configure PostgreSQL connection
vault write database/config/${POSTGRES_DB} \
    plugin_name=postgresql-database-plugin \
    allowed_roles="django_user-role" \
    connection_url="postgresql://{{username}}:{{password}}@postgres-db:${POSTGRES_PORT}/${POSTGRES_DB}" \
    username=${POSTGRES_USER} \
    password=${POSTGRES_PASSWORD}

# Create a dynamic role
vault write database/roles/django_user-role \
    db_name=${POSTGRES_DB} \
    creation_statements="CREATE ROLE \"{{name}}\" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}';
                        GRANT USAGE ON SCHEMA public TO \"{{name}}\";
                        GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO \"{{name}}\";
                        GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO \"{{name}}\";" \
    revocation_statements= "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE usename = '{{name}}';
                    REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM \"{{name}}\";
                    REVOKE USAGE ON SCHEMA public FROM \"{{name}}\";
                    DROP ROLE IF EXISTS \"{{name}}\";" \
    default_ttl="1m" \
    max_ttl="24h"

if (vault read database/creds/django_user-role); then
    echo "🔑 Database role created successfully!"
    # Bring Vault back to the foreground
    wait $VAULT_PID
else
    echo "❌ Failed to create database role!"
fi
