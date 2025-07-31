@echo off
REM Video Downloader API - Docker Management Script for Windows

if "%1"=="help" goto :help
if "%1"=="dev" goto :dev
if "%1"=="dev-build" goto :dev-build
if "%1"=="prod" goto :prod
if "%1"=="prod-build" goto :prod-build
if "%1"=="stop" goto :stop
if "%1"=="logs" goto :logs
if "%1"=="clean" goto :clean
if "%1"=="health" goto :health

:help
echo Video Downloader API - Docker Commands
echo.
echo Usage: docker-run.bat [command]
echo.
echo Commands:
echo   dev           Start development environment
echo   dev-build     Build and start development environment
echo   prod          Start production environment
echo   prod-build    Build and start production environment
echo   stop          Stop all services
echo   logs          View logs
echo   clean         Clean up containers and volumes
echo   health        Check application health
echo   help          Show this help
echo.
echo Example: docker-run.bat dev
goto :end

:dev
echo Starting development environment...
docker-compose -f docker-compose.dev.yml up
goto :end

:dev-build
echo Building and starting development environment...
docker-compose -f docker-compose.dev.yml up --build
goto :end

:prod
echo Starting production environment...
docker-compose -f docker-compose.prod.yml up -d
goto :end

:prod-build
echo Building and starting production environment...
docker-compose -f docker-compose.prod.yml up -d --build
goto :end

:stop
echo Stopping all services...
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.prod.yml down
goto :end

:logs
docker-compose logs -f
goto :end

:clean
echo Cleaning up containers and volumes...
docker-compose down -v --remove-orphans
docker-compose -f docker-compose.dev.yml down -v --remove-orphans
docker-compose -f docker-compose.prod.yml down -v --remove-orphans
docker system prune -f
goto :end

:health
echo Checking application health...
curl -f http://localhost:3001/health
goto :end

:end
