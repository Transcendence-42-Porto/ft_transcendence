from django.apps import AppConfig
import time
import threading
import os
from decouple import config
from django.apps import AppConfig
from django.conf import settings
from vault_connector.vault_connection import get_vault_credentials

# ---- Vault connection ---- #
VAULT_ADDR = config("VAULT_ADDR")
VAULT_TOKEN = config("VAULT_TOKEN")
REFRESH_INTERVAL = 60  # 1 minute
ROLE_NAME = "user_management_service"

class VaultConnectorConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'vault_connector'
    has_run = False

    def ready(self):
        if os.environ.get("RUN_MAIN") != "true":
            return
        if VaultConnectorConfig.has_run is True:
            return
        try:
            self.start_vault_refresh()
            VaultConnectorConfig.has_run = True
            print("✅ Vault refresh thread successfully started!")
        except Exception as e:
            print(f"❌ ERROR starting Vault refresh thread: {e}")

    def start_vault_refresh(self):
        #-- Runs Vault credential refresh in a background thread --""
        def refresh_loop():
            while True:
                    print("🔄 Fetching new Vault credentials...")
                    username, password = get_vault_credentials()
                    if (username is not None and password is not None):
                        settings.DATABASES['default']['USER'] = username
                        settings.DATABASES['default']['PASSWORD'] = password
                    time.sleep(REFRESH_INTERVAL)

        thread = threading.Thread(target=refresh_loop, daemon=True)
        thread.start()