@echo off
REM Start Redis container using Docker Compose
REM This provides the message broker for Celery

echo.
echo ========================================
echo Starting Redis (Docker Compose)
echo ========================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not installed or not in PATH
    echo Please install Docker Desktop: https://www.docker.com/products/docker-desktop
    exit /b 1
)

REM Check if Docker daemon is running
docker ps >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker daemon is not running
    echo Please start Docker Desktop and try again
    exit /b 1
)

echo [1/1] Starting Redis service...
docker-compose up -d redis

if errorlevel 1 (
    echo ERROR: Failed to start Redis container
    exit /b 1
)

echo.
echo ========================================
echo Redis started successfully!
echo ========================================
echo.
echo Redis is running on: redis://localhost:6379
echo.
echo Next steps:
echo 1. Open another terminal and run: start_celery_worker.bat
echo 2. Open another terminal and run: start_fastapi.bat
echo 3. Frontend: npm run dev
echo.
pause
