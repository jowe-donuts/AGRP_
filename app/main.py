"""FastAPI application entry‑point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import admin, auth, claims, items
from app.core.config import settings

app = FastAPI(
    title="Ay, Gamit Ko 'To! – Lost & Found Platform",
    description="Campus‑wide lost‑and‑found service with AI‑driven matching.",
    version="0.1.0",
)

# ----------------------------------------------------------------------
# CORS – allow the frontend (adjust origins in production)
# ----------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # replace with specific domains in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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