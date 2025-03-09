# Base image
FROM hashicorp/vault:1.15.0

# Install curl and jq for HTTP requests
RUN apk add --no-cache curl jq

# Copy the initialization script
COPY ./entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# COPY ./config.hcl /vault/config/config.hcl
# Set environment variables
# ENV VAULT_ADDR=http://127.0.0.1:8200
# ENV VAULT_TOKEN=root
# ENV POSTGRES_PORT=5432
# ENV POSTGRES_DB=postgres
# ENV POSTGRES_USER=db_user
# ENV POSTGRES_PASSWORD=db_password321

# Expose Vault port
EXPOSE 8200

# Run Vault and initialize it
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]