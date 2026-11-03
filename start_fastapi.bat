@echo off
REM Start FastAPI server (backend only, no Celery in-process)

echo.
echo ========================================
echo Starting FastAPI Server
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

echo Running database migrations...
alembic upgrade head
if errorlevel 1 (
    echo WARNING: Database migrations failed. Continuing anyway...
)

echo.
echo Starting FastAPI server on http://localhost:8000
echo.
echo Make sure Redis and Celery worker are running:
echo - Run: start_redis.bat (in another terminal)
echo - Run: start_celery_worker.bat (in another terminal)
echo.

REM Start FastAPI server with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

if errorlevel 1 (
    echo ERROR: FastAPI server failed to start
    exit /b 1
)

pause
