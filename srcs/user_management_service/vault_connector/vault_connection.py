import requests
from django.conf import settings
from decouple import config

#---- Vault connection ---- #
VAULT_ADDR = config("VAULT_ADDR")
VAULT_TOKEN = config("VAULT_TOKEN")
ROLE_NAME = "user_management_service"
REFRESH_INTERVAL = 60 ## 3600  # 60 minutes
 

def get_vault_credentials():
    """Fetches database credentials from Vault and updates environment variables"""
    try:
        url = f"{VAULT_ADDR}/v1/database/creds/django_user-role"
        headers = {"X-Vault-Token": VAULT_TOKEN}
        response = requests.get(url, headers=headers)

        if response.status_code != 200:
            print(f"❌ Vault returned error: {response.status_code} - {response.text}")
            return

        data = response.json()
        username = data["data"].get("username")
        password = data["data"].get("password")

        if username and password:
            print("✅ Retrieved credentials")
            return username, password
        else:
            print("❌ Vault did not return credentials")
            return None, None
    except Exception as e:
        print(f"⚠️ Error retrieving Vault credentials: {e}")
        return None, None