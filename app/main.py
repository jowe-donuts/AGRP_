"""FastAPI application entry‑point."""

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api import admin, auth, claims, items
from app.core.config import settings

app = FastAPI(
    title="Ay, Gamit Ko 'To! – Lost & Found Platform",
    description="Campus‑wide lost‑and‑found service with AI‑driven matching.",
    version="0.1.0",
)

# CORS – allow only configured frontend origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.cors_origins.split(",")],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["*"],
)

# Serve uploaded images
uploads_dir = os.path.join(os.getcwd(), "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# ----------------------------------------------------------------------
# Routers
# ----------------------------------------------------------------------
app.include_router(auth.router)
app.include_router(items.router)
app.include_router(claims.router)
app.include_router(admin.router)

# ----------------------------------------------------------------------
# Root health‑check endpoint
# ----------------------------------------------------------------------
@app.get("/", tags=["health"])
async def root():
    return {"message": "Ay, Gamit Ko 'To! API is up and running"}