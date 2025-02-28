#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys
import requests
from decouple import config
import time


# # ---- Vault connection ---- #
# VAULT_ADDR = config("VAULT_ADDR")
# VAULT_TOKEN = config("VAULT_TOKEN")
# ROLE_NAME = "user_management_service"
 
# # Get the database credentials from Vault
# def get_vault_credentials():
#     """Fetches database credentials from Vault"""
#     try:
#         url = f"{VAULT_ADDR}/v1/database/creds/django_user-role"
#         headers = {"X-Vault-Token": VAULT_TOKEN}
#         response = requests.get(url, headers=headers)
#         data = response.json()
        
#         username = data["data"].get("username")
#         password = data["data"].get("password")

#         if username and password:
#             print(f"✅ Retrieved credentials: {username}")
#             return username, password
#         else:
#             print("❌ Vault did not return credentials")
#             return None, None
#     except Exception as e:
#         print(f"⚠️ Error retrieving Vault credentials: {e}")
#         return None, None

# DB_USER, DB_PASS = get_vault_credentials()
# os.environ["VAULT_DB_USER"] = DB_USER
# os.environ["VAULT_DB_PASSWORD"] = DB_PASS

    # while True:
    #     time.sleep(30)
# print(f"Database credentials: {DB_USER}")
# print(f"Database password: {DB_PASS}")

# print(f"Database credentials: {os.environ.get('VAULT_DB_USER')}")
# print(f"Database password: {os.environ.get('VAULT_DB_PASSWORD')}")

# ---- End of vault connection code ---- #



def main():
    """Run administrative tasks."""
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "setup.settings")
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == "__main__":
    main()
