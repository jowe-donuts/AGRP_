@echo off
REM Start script for Ay, Gamit Ko 'To! Backend (SQLite + Redis)
REM This script starts Redis, Celery worker, and FastAPI in parallel

echo.
echo ========================================
echo Ay, Gamit Ko 'To! - Backend Startup
echo ========================================
echo.

REM Check if .env exists
if not exist .env (
    echo ERROR: .env file not found. Please create .env in the project root.
    exit /b 1
)

REM Check if virtual environment is activated
if not defined VIRTUAL_ENV (
    echo Activating virtual environment...
    call .venv\Scripts\activate.bat
    if errorlevel 1 (
        echo ERROR: Failed to activate virtual environment.
        exit /b 1
    )
)

echo Starting services...
echo.

REM Start Docker Compose (Redis only - SQLite is file-based, no server needed)
echo [1/3] Starting Redis via Docker Compose...
start "Docker Compose" cmd /k "docker compose up"

REM Wait a few seconds for Redis to be ready
timeout /t 3 /nobreak

REM Run Alembic migrations (creates/updates SQLite database)
echo [2/3] Running database migrations (SQLite)...
alembic upgrade head
if errorlevel 1 (
    echo ERROR: Database migrations failed.
    exit /b 1
)

REM Start Celery worker
echo [3/3] Starting Celery worker...
start "Celery Worker" cmd /k "celery -A app.workers.tasks.CELERY_APP worker -l info -Q agp"

REM Wait a second for Celery to initialize
timeout /t 2 /nobreak

REM Start FastAPI
echo [4/4] Starting FastAPI server...
start "FastAPI Server" cmd /k "uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

echo.
echo ========================================
echo Services started successfully!
echo ========================================
echo.
echo FastAPI:       http://localhost:8000
echo Swagger UI:    http://localhost:8000/docs
echo ReDoc:         http://localhost:8000/redoc
echo Redis:         localhost:6379
echo SQLite DB:     ./agp.db (file-based, no server needed)
echo.
echo To stop all services, close each window or press Ctrl+C in each terminal.
echo.
pause
