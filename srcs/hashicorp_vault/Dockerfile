# Base image
FROM hashicorp/vault:1.15.0

# Install curl and jq for HTTP requests
RUN apk add --no-cache curl jq

# Copy the initialization script
COPY ./entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Expose Vault port
EXPOSE 8200

# Run Vault and initialize it
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
