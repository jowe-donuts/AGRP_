@echo off
REM Master startup script - runs Redis, Celery, and FastAPI all at once

echo.
echo ============================================================
echo Ay, Gamit Ko 'To! - Complete Backend Startup
echo ============================================================
echo.
echo This script will start:
echo   1. Redis (message broker)
echo   2. Celery worker (background tasks for CLIP AI)
echo   3. FastAPI server (API)
echo.
echo Requirements:
echo   - Docker Desktop must be running
echo   - Python virtual environment (.venv)
echo.

REM Check Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not installed or not running
    echo Please install Docker Desktop: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo [STEP 1] Starting Redis container...
docker-compose up -d redis
if errorlevel 1 (
    echo ERROR: Failed to start Redis
    pause
    exit /b 1
)
timeout /t 3 /nobreak

echo [STEP 2] Activating virtual environment...
call .venv\Scripts\activate.bat
if errorlevel 1 (
    echo ERROR: Failed to activate virtual environment
    pause
    exit /b 1
)

echo [STEP 3] Running database migrations...
alembic upgrade head

echo.
echo ============================================================
echo Starting services in new terminal windows...
echo ============================================================
echo.

REM Start Celery worker in new window
start "Celery Worker" cmd /k "call .venv\Scripts\activate.bat && celery -A app.workers.tasks worker --loglevel=info --queue=agp --concurrency=1"
timeout /t 2 /nobreak

REM Start FastAPI in new window
start "FastAPI Server" cmd /k "call .venv\Scripts\activate.bat && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

echo.
echo ============================================================
echo Services started! Waiting for initialization...
echo ============================================================
echo.
timeout /t 3 /nobreak

echo.
echo Frontend:      http://localhost:5173 (run: npm run dev in another terminal)
echo FastAPI:       http://localhost:8000
echo Swagger UI:    http://localhost:8000/docs
echo Redis:         localhost:6379
echo.
echo CLIP AI matching is now ACTIVE with proper Celery + Redis
echo.
echo To stop all services:
echo 1. Close the Celery Worker window
echo 2. Close the FastAPI Server window
echo 3. Run: docker-compose down
echo.
pause
