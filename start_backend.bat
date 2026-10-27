@echo off
REM Start script for Ay, Gamit Ko 'To! Backend (No Docker, No Redis)
REM Runs FastAPI + Celery with in-memory task queue
REM Simplest setup: just Python, no external services needed

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
    echo ERROR: Database migrations failed.
    exit /b 1
)

echo.
echo [2/2] Starting FastAPI server...
echo (Celery tasks will run in-process, no separate worker needed)
echo.

REM Start FastAPI with Celery in eager mode (synchronous task execution)
start "FastAPI Server" cmd /k "uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

echo.
echo ========================================
echo Services started successfully!
echo ========================================
echo.
echo Frontend:      http://localhost:5173 (run: npm run dev in another terminal)
echo FastAPI:       http://localhost:8000
echo Swagger UI:    http://localhost:8000/docs
echo ReDoc:         http://localhost:8000/redoc
echo Database:      ./agp.db (SQLite, file-based)
echo.
echo Background tasks (CLIP embeddings, matching) run synchronously.
echo.
echo To stop: close this window or press Ctrl+C
echo.
pause
