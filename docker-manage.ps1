# PowerShell Scripts for Docker Management
# Windows PowerShell equivalent of Makefile commands

Write-Host "Video Downloader API - Docker Management Scripts" -ForegroundColor Green
Write-Host ""

function Show-Help {
    Write-Host "Available Commands:" -ForegroundColor Yellow
    Write-Host "  .\docker-dev.ps1        - Start development environment" -ForegroundColor Cyan
    Write-Host "  .\docker-prod.ps1       - Start production environment" -ForegroundColor Cyan
    Write-Host "  .\docker-stop.ps1       - Stop all environments" -ForegroundColor Cyan
    Write-Host "  .\docker-logs.ps1       - View logs" -ForegroundColor Cyan
    Write-Host "  .\docker-status.ps1     - Check container status" -ForegroundColor Cyan
    Write-Host "  .\docker-clean.ps1      - Clean up containers and volumes" -ForegroundColor Cyan
    Write-Host "  .\docker-health.ps1     - Check application health" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Yellow
    Write-Host "  .\docker-dev.ps1" -ForegroundColor White
    Write-Host "  .\docker-prod.ps1" -ForegroundColor White
    Write-Host "  .\docker-health.ps1" -ForegroundColor White
}

# Check if specific action is requested
param(
    [string]$Action = "help"
)

switch ($Action.ToLower()) {
    "dev" {
        Write-Host "Starting development environment..." -ForegroundColor Green
        docker-compose -f docker-compose.dev.yml up --build
    }
    "dev-detached" {
        Write-Host "Starting development environment in detached mode..." -ForegroundColor Green
        docker-compose -f docker-compose.dev.yml up -d --build
    }
    "prod" {
        Write-Host "Starting production environment..." -ForegroundColor Green
        docker-compose -f docker-compose.prod.yml up -d --build
    }
    "stop" {
        Write-Host "Stopping all containers..." -ForegroundColor Yellow
        docker-compose -f docker-compose.dev.yml down
        docker-compose -f docker-compose.prod.yml down
        docker-compose down
    }
    "logs" {
        Write-Host "Viewing application logs..." -ForegroundColor Cyan
        docker-compose -f docker-compose.dev.yml logs -f
    }
    "status" {
        Write-Host "Checking container status..." -ForegroundColor Cyan
        docker-compose ps
        docker-compose -f docker-compose.dev.yml ps
        docker-compose -f docker-compose.prod.yml ps
    }
    "health" {
        Write-Host "Checking application health..." -ForegroundColor Green
        try {
            $response = Invoke-RestMethod -Uri "http://localhost:3001/health" -Method Get
            Write-Host "Health Check: " -NoNewline -ForegroundColor Green
            Write-Host $response.status -ForegroundColor White
            Write-Host "Uptime: " -NoNewline -ForegroundColor Green
            Write-Host "$([math]::Round($response.uptime, 2)) seconds" -ForegroundColor White
            Write-Host "Timestamp: " -NoNewline -ForegroundColor Green
            Write-Host $response.timestamp -ForegroundColor White
        }
        catch {
            Write-Host "Health check failed: $_" -ForegroundColor Red
        }
    }
    "clean" {
        Write-Host "Cleaning up Docker resources..." -ForegroundColor Red
        docker-compose down -v --remove-orphans
        docker-compose -f docker-compose.dev.yml down -v --remove-orphans
        docker-compose -f docker-compose.prod.yml down -v --remove-orphans
        docker system prune -f
    }
    "build" {
        Write-Host "Building Docker images..." -ForegroundColor Blue
        docker build --target development -t video-downloader:dev .
        docker build --target production -t video-downloader:prod .
    }
    default {
        Show-Help
    }
}
