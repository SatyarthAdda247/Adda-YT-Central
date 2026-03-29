import json
import os
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.responses import RedirectResponse, HTMLResponse
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request

# Create a standalone FastAPI app for auth
auth_app = FastAPI(title="YouTube Auth Service")

CLIENT_SECRETS_FILE = "client_secret.json"
SCOPES = [
    "https://www.googleapis.com/auth/youtube.readonly",
    "https://www.googleapis.com/auth/yt-analytics.readonly",
]
# Updated redirect URI to match the new auth service port (8001)
REDIRECT_URI = "http://localhost:8001/auth/callback"
TOKEN_FILE = "tokens.json"


def save_tokens(credentials):
    """Helper to save credentials to tokens.json."""
    token_data = {
        "access_token": credentials.token,
        "refresh_token": credentials.refresh_token,
        "token_uri": credentials.token_uri,
        "client_id": credentials.client_id,
        "client_secret": credentials.client_secret,
        "scopes": credentials.scopes,
        "expiry": credentials.expiry.isoformat() if credentials.expiry else None
    }
    with open(TOKEN_FILE, "w") as f:
        json.dump(token_data, f, indent=2)
    return token_data


def get_credentials():
    """Retrieves credentials, refreshing them automatically if needed."""
    if not os.path.exists(TOKEN_FILE):
        return None

    with open(TOKEN_FILE, "r") as f:
        data = json.load(f)

    expiry = data.get("expiry")
    if expiry:
        expiry = datetime.fromisoformat(expiry)

    creds = Credentials(
        token=data["access_token"],
        refresh_token=data["refresh_token"],
        token_uri=data["token_uri"],
        client_id=data["client_id"],
        client_secret=data["client_secret"],
        scopes=data["scopes"],
        expiry=expiry
    )

    if creds.expired or not creds.token:
        try:
            print("🔄 Refreshing access token...")
            creds.refresh(Request())
            save_tokens(creds)
            print("✅ Token refreshed and saved.")
        except Exception as e:
            print(f"❌ Failed to refresh token: {e}")
            return None

    return creds


@auth_app.get("/auth/youtube")
def auth_youtube():
    """Redirects the user to Google's OAuth consent screen."""
    flow = Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE,
        scopes=SCOPES,
        redirect_uri=REDIRECT_URI,
    )
    auth_url, state = flow.authorization_url(
        access_type="offline",
        prompt="consent",
        include_granted_scopes="true",
    )
    return RedirectResponse(url=auth_url)


@auth_app.get("/auth/callback")
def auth_callback(code: str = None, error: str = None):
    """Google redirects here with an authorization code."""
    if error:
        raise HTTPException(status_code=400, detail=f"Authorization failed: {error}")
    if not code:
        raise HTTPException(status_code=400, detail="No authorization code received")

    flow = Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE,
        scopes=SCOPES,
        redirect_uri=REDIRECT_URI,
    )

    flow.fetch_token(code=code)
    credentials = flow.credentials
    save_tokens(credentials)

    print("\n" + "=" * 60)
    print("✅ AUTHORIZATION SUCCESSFUL!")
    print(f"   Refresh Token: {credentials.refresh_token[:20]}...")
    print(f"   Stored in: {TOKEN_FILE}")
    print("=" * 60 + "\n")

    return HTMLResponse(content="""
    <html>
    <body style="font-family: Arial; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f5f5f5;">
        <div style="text-align: center; padding: 40px; background: white; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #1a73e8;">✅ Authorization Successful!</h1>
            <p style="color: #666; font-size: 18px;">YouTube Dashboard has been authorized.</p>
            <p style="color: #999;">You can close this tab now.</p>
        </div>
    </body>
    </html>
    """)


@auth_app.get("/auth/status")
def auth_status():
    """Check if we are authorized and tokens are fresh."""
    creds = get_credentials()
    if creds:
        return {
            "status": "authorized",
            "has_refresh_token": bool(creds.refresh_token),
            "scopes": creds.scopes,
            "expired": creds.expired,
            "expiry": creds.expiry.isoformat() if creds.expiry else None
        }
    return {"status": "not_authorized", "message": "Visit /auth/youtube to authorize"}


@auth_app.get("/auth/refresh")
def force_refresh():
    """Manually force a token refresh."""
    creds = get_credentials()
    if not creds:
        raise HTTPException(status_code=401, detail="Not authorized.")

    creds.refresh(Request())
    save_tokens(creds)

    return {
        "message": "Token refreshed successfully",
        "access_token": creds.token[:15] + "...",
        "expiry": creds.expiry.isoformat()
    }


@auth_app.get("/auth/token")
def get_current_token():
    """Returns the current active access token."""
    creds = get_credentials()
    if not creds:
        raise HTTPException(status_code=401, detail="Not authorized.")

    return {
        "access_token": creds.token,
        "ttl_info": "Google access tokens last for 1 hour by default.",
        "expiry": creds.expiry.isoformat() if creds.expiry else None,
    }


if __name__ == "__main__":
    import uvicorn
    os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"
    
    # Generate the remote login URL instantly on startup
    flow = Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE,
        scopes=SCOPES,
        redirect_uri=REDIRECT_URI,
    )
    auth_url, _ = flow.authorization_url(
        access_type="offline",
        prompt="consent",
        include_granted_scopes="true",
    )
    
    print("\n" + "=" * 80)
    print("🔒 Auth Service Running")
    print("\n👉 REMOTE LOGIN LINK (Copy and send this huge link to the channel owner):")
    print(f"\n{auth_url}\n")
    print("👉 LOCAL LOGIN LINK (If you are the owner, just click this):")
    print("   http://localhost:8001/auth/youtube")
    print("=" * 80 + "\n")
    
    uvicorn.run(auth_app, host="0.0.0.0", port=8001)
