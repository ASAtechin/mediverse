#!/usr/bin/env python3
"""
Enable Google Sign-In for the Clinicia Firebase project.

Usage:
  python3 scripts/enable-google-signin.py <WEB_CLIENT_ID> <WEB_CLIENT_SECRET>

The Web Client ID and Secret come from the Firebase Console:
  1. Go to https://console.firebase.google.com/project/clinicia-replica/authentication/providers
  2. Click "Google" → Enable → copy the Web Client ID and Secret
  3. Run this script with those values

OR get them from the GCP Console:
  1. Go to https://console.cloud.google.com/apis/credentials?project=clinicia-replica
  2. Find "Web client (auto created by Google Service)" under OAuth 2.0 Client IDs
  3. Copy the Client ID and Client Secret
"""

import sys
import json
import urllib.request
import urllib.error

def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)

    client_id = sys.argv[1]
    client_secret = sys.argv[2]

    sa_path = "clinicia-backend/service-account.json"
    try:
        sa = json.load(open(sa_path))
    except FileNotFoundError:
        print(f"Error: {sa_path} not found. Run from the project root.")
        sys.exit(1)

    project_id = sa["project_id"]

    try:
        from google.oauth2 import service_account
        from google.auth.transport.requests import Request
    except ImportError:
        print("Installing google-auth...")
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "--user", "google-auth"])
        from google.oauth2 import service_account
        from google.auth.transport.requests import Request

    creds = service_account.Credentials.from_service_account_file(
        sa_path,
        scopes=[
            "https://www.googleapis.com/auth/identitytoolkit",
            "https://www.googleapis.com/auth/firebase",
            "https://www.googleapis.com/auth/cloud-platform",
        ],
    )
    creds.refresh(Request())
    token = creds.token

    # Enable Google Sign-In via Identity Toolkit Admin API
    url = f"https://identitytoolkit.googleapis.com/admin/v2/projects/{project_id}/defaultSupportedIdpConfigs?idpId=google.com"
    body = json.dumps({
        "enabled": True,
        "clientId": client_id,
        "clientSecret": client_secret,
    }).encode()

    req = urllib.request.Request(url, data=body, headers={
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    })

    try:
        resp = urllib.request.urlopen(req)
        result = json.loads(resp.read())
        print("✅ Google Sign-In enabled successfully!")
        print(json.dumps(result, indent=2))
    except urllib.error.HTTPError as e:
        error_body = e.read().decode()
        if e.code == 409:
            # Already exists — try PATCH to update/enable it
            patch_url = f"https://identitytoolkit.googleapis.com/admin/v2/projects/{project_id}/defaultSupportedIdpConfigs/google.com?updateMask=enabled,clientId,clientSecret"
            patch_req = urllib.request.Request(patch_url, data=body, headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
            }, method="PATCH")
            try:
                patch_resp = urllib.request.urlopen(patch_req)
                result = json.loads(patch_resp.read())
                print("✅ Google Sign-In updated and enabled!")
                print(json.dumps(result, indent=2))
            except urllib.error.HTTPError as e2:
                print(f"❌ Failed to update: {e2.code} - {e2.read().decode()[:500]}")
                sys.exit(1)
        else:
            print(f"❌ Failed: {e.code} - {error_body[:500]}")
            sys.exit(1)

    # Verify
    print("\nVerifying...")
    verify_url = f"https://identitytoolkit.googleapis.com/admin/v2/projects/{project_id}/defaultSupportedIdpConfigs/google.com"
    verify_req = urllib.request.Request(verify_url, headers={"Authorization": f"Bearer {token}"})
    try:
        verify_resp = urllib.request.urlopen(verify_req)
        config = json.loads(verify_resp.read())
        if config.get("enabled"):
            print("✅ Verified: Google Sign-In is ENABLED")
        else:
            print("⚠️  Config exists but is not enabled")
    except urllib.error.HTTPError:
        print("⚠️  Could not verify")


if __name__ == "__main__":
    main()
