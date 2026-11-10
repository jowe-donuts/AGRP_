@echo off
REM Download and setup Redis for Windows
REM Uses pre-compiled Redis binary from https://github.com/microsoftarchive/redis/releases

setlocal enabledelayedexpansion

echo.
echo ========================================
echo Redis Setup for Windows
echo ========================================
echo.

REM Check if Redis already exists
if exist "redis-server.exe" (
    echo Redis already downloaded. Skipping download.
    goto :start_redis
)

echo Downloading Redis for Windows...
echo This may take a minute...
echo.

REM Download Redis binary (3.2.100 - latest Windows release)
REM Using direct GitHub release URL
powershell -Command "
try {
    $url = 'https://github.com/microsoftarchive/redis/releases/download/win-3.2.100/Redis-x64-3.2.100.zip'
    $output = 'redis-windows.zip'
    Write-Host 'Downloading from: $url'
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    $ProgressPreference = 'SilentlyContinue'
    Invoke-WebRequest -Uri $url -OutFile $output
    Write-Host 'Download complete. Extracting...'
    Expand-Archive -Path $output -DestinationPath . -Force
    Remove-Item $output
    Write-Host 'Redis extracted successfully'
} catch {
    Write-Host 'ERROR: Failed to download Redis'
    Write-Host $_.Exception.Message
    exit 1
}
"

if errorlevel 1 (
    echo.
    echo ERROR: Could not download Redis automatically
    echo.
    echo Alternative: Download manually from:
    echo https://github.com/microsoftarchive/redis/releases/download/win-3.2.100/Redis-x64-3.2.100.zip
    echo.
    echo Extract to current directory and run this script again.
    pause
    exit /b 1
)

:start_redis
echo.
echo ========================================
echo Starting Redis Server
echo ========================================
echo.
echo Redis will run on localhost:6379
echo Press Ctrl+C to stop
echo.

REM Run Redis server
if exist "redis-server.exe" (
    redis-server.exe --port 6379
) else (
    echo ERROR: redis-server.exe not found
    pause
    exit /b 1
)
