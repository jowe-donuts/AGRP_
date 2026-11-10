@echo off
REM Start FastAPI server with Celery in eager mode (synchronous task execution)
REM No Redis, no separate Celery worker needed - everything runs in-process

echo.
echo ========================================
echo Ay, Gamit Ko 'To! - Backend Startup
echo (No Docker, No Redis - Pure Python)
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

REM Run Alembic migrations (creates/updates SQLite database)
echo [1/2] Running database migrations (SQLite)...
alembic upgrade head
if errorlevel 1 (
    echo WARNING: Database migrations failed. Continuing anyway...
)

echo.
echo [2/2] Starting FastAPI server...
echo (Celery tasks run synchronously - no separate worker needed)
echo.

REM Start FastAPI with Celery in eager mode (synchronous task execution)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

if errorlevel 1 (
    echo ERROR: FastAPI server failed
    exit /b 1
)

pause
