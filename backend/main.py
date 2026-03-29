import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Import the router from our data service module
from youtube_service import youtube_router

app = FastAPI(
    title="Adda247 YouTube Central Mind",
    description="A microservices-based API for handling YouTube OAuth and Analytics Data Fetching."
)

# Enable CORS for the React Dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "*"], # Allow Vite default port and wildcard for testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect the microservices to the main app
app.include_router(youtube_router)


@app.get("/")
def root():
    return {
        "message": "Welcome to YouTube Central Mind API",
        "docs": "Visit /docs for Interactive API Documentation"
    }


if __name__ == "__main__":
    # Allow OAuth over HTTP for local testing during development
    os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

    print("\n" + "=" * 60)
    print("🚀 YouTube Data Analytics Server")
    print("   Data APIs: http://localhost:8000/yt/...")
    print("   Docs (Swagger): http://localhost:8000/docs")
    print("   Note: Ensure Auth Service is running separately if tokens expire")
    print("=" * 60 + "\n")

    uvicorn.run(app, host="0.0.0.0", port=8000)