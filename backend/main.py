import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uvicorn

# In production, FRONTEND_URL is set via ConfigMap/env.
# Falls back to localhost for local development.
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")

# Import the router from our data service module
from youtube_service import youtube_router

app = FastAPI(
    title="Adda247 YouTube Central Mind",
    description="A microservices-based API for handling YouTube OAuth and Analytics Data Fetching."
)

# Enable CORS for the React Dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect the microservices to the main app
app.include_router(youtube_router)


@app.get("/api/health")
def health():
    return {"status": "ok", "message": "YouTube Central Mind API is running"}


# Serve React frontend (built static files) in production
STATIC_DIR = Path(__file__).parent.parent / "frontend" / "dist"
if STATIC_DIR.exists():
    app.mount("/assets", StaticFiles(directory=STATIC_DIR / "assets"), name="assets")

    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        """Serve React app for all non-API routes."""
        file_path = STATIC_DIR / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(STATIC_DIR / "index.html")
else:
    @app.get("/")
    def root():
        return {
            "message": "Welcome to YouTube Central Mind API",
            "docs": "Visit /docs for Interactive API Documentation",
            "note": "Frontend not built yet. Run 'npm run build' in frontend/"
        }


if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("🚀 YouTube Data Analytics Server")
    print("   Data APIs: http://localhost:8000/yt/...")
    print("   Docs (Swagger): http://localhost:8000/docs")
    print("   Note: Ensure Auth Service is running separately if tokens expire")
    print("=" * 60 + "\n")

    uvicorn.run(app, host="0.0.0.0", port=8000)