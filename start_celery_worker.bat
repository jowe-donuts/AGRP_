@echo off
REM Start Celery worker for background tasks (CLIP embeddings, matching)

echo.
echo ========================================
echo Starting Celery Worker
echo ========================================
echo.

REM Check if .env exists
if not exist .env (
    echo ERROR: .env file not found
    exit /b 1
)

REM Check if virtual environment is activated
if not defined VIRTUAL_ENV (
    echo Activating virtual environment...
    call .venv\Scripts\activate.bat
    if errorlevel 1 (
        echo ERROR: Failed to activate virtual environment
        exit /b 1
    )
)

echo Starting Celery worker (processing CLIP embeddings and matching)...
echo.
echo Make sure Redis is running before starting this worker!
echo Run: start_redis.bat (in another terminal)
echo.

REM Start Celery worker
REM Uses the agp queue and processes CLIP embedding/matching tasks
celery -A app.workers.tasks worker --loglevel=info --queue=agp --concurrency=1

if errorlevel 1 (
    echo ERROR: Celery worker failed
    echo Make sure Redis is running on localhost:6379
    exit /b 1
)

pause
