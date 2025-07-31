# Docker Compose Quick Start Guide

This document provides instructions for running the Video Downloader API using Docker Compose.

## Prerequisites

- Docker (version 20.10+)
- Docker Compose (version 2.0+)

## Quick Start

### Development Mode

1. **Clone and navigate to the project directory:**
   ```bash
   cd youtube-downloader
   ```

2. **Start the development environment:**
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

3. **Access the application:**
   - API: http://localhost:3001
   - Swagger Documentation: http://localhost:3001/api/docs

### Production Mode

1. **Start the production environment:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

2. **Check service status:**
   ```bash
   docker-compose -f docker-compose.prod.yml ps
   ```

## Available Services

### Core Services

- **app**: Main NestJS application (production)
- **app-dev**: Development version with hot reload

### Optional Services (use profiles)

- **redis**: Caching service
  ```bash
  docker-compose --profile cache up -d
  ```

- **nginx**: Reverse proxy with load balancing
  ```bash
  docker-compose --profile proxy up -d
  ```

## Configuration Options

### Environment Variables

Create `.env` file in the project root:
```bash
cp .env.development .env
```

Key variables:
- `NODE_ENV`: Environment mode (development/production)
- `PORT`: Application port (default: 3001)
- `CORS_ORIGIN`: Allowed origins for CORS
- `RATE_LIMIT_LIMIT`: API rate limiting

### Docker Compose Profiles

Use profiles to selectively start services:

```bash
# Start with Redis caching
docker-compose --profile cache up -d

# Start with Nginx proxy
docker-compose --profile proxy up -d

# Start with both Redis and Nginx
docker-compose --profile cache --profile proxy up -d
```

## Common Commands

### Development

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up

# Start in background
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down
```

### Production

```bash
# Start production environment
docker-compose -f docker-compose.prod.yml up -d

# Scale the application
docker-compose -f docker-compose.prod.yml up -d --scale app=3

# Update and restart
docker-compose -f docker-compose.prod.yml up -d --build --force-recreate

# Stop services
docker-compose -f docker-compose.prod.yml down
```

### Maintenance

```bash
# View service status
docker-compose ps

# View logs
docker-compose logs -f app

# Execute commands in container
docker-compose exec app sh

# Remove unused containers and images
docker system prune -a

# Backup downloads volume
docker run --rm -v youtube-downloader_downloads:/data -v $(pwd)/backup:/backup ubuntu tar czf /backup/downloads-backup.tar.gz -C /data .
```

## Volume Management

### Downloads Volume

Downloaded videos are stored in a Docker volume:
```bash
# Inspect volume
docker volume inspect youtube-downloader_downloads

# Backup volume
docker run --rm -v youtube-downloader_downloads:/data -v $(pwd):/backup ubuntu cp -r /data /backup/downloads

# Restore volume
docker run --rm -v youtube-downloader_downloads:/data -v $(pwd):/backup ubuntu cp -r /backup/downloads/* /data/
```

### Redis Data (if using cache profile)

```bash
# Backup Redis data
docker run --rm -v youtube-downloader_redis-data:/data -v $(pwd)/backup:/backup ubuntu tar czf /backup/redis-backup.tar.gz -C /data .

# Restore Redis data
docker run --rm -v youtube-downloader_redis-data:/data -v $(pwd)/backup:/backup ubuntu tar xzf /backup/redis-backup.tar.gz -C /data
```

## Health Checks

All services include health checks:

```bash
# Check application health
curl http://localhost:3001/health

# Check container health status
docker-compose ps
```

Health check response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 123.456
}
```

## Nginx Configuration (Optional)

When using the nginx profile:

1. **Custom SSL certificates:**
   - Place certificates in `./ssl/` directory
   - Update `nginx.conf` with correct paths

2. **Rate limiting:**
   - Configured for 10 requests/second per IP
   - Burst of 20 requests allowed

3. **File upload limits:**
   - Set to 500MB for large video downloads

## Performance Tuning

### Resource Limits

Production configuration includes resource limits:
- Memory: 1GB limit, 512MB reservation
- CPU: 0.5 CPU limit, 0.25 CPU reservation

### Scaling

Scale the application for high load:
```bash
docker-compose -f docker-compose.prod.yml up -d --scale app=3
```

## Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Change port in environment variables
   PORT=3002 docker-compose up
   ```

2. **Permission denied on downloads:**
   ```bash
   # Fix volume permissions
   docker-compose exec app chown -R nestjs:nodejs /app/downloads
   ```

3. **Out of memory:**
   ```bash
   # Increase container memory limit in docker-compose.prod.yml
   ```

### Debugging

1. **View application logs:**
   ```bash
   docker-compose logs -f app
   ```

2. **Access container shell:**
   ```bash
   docker-compose exec app sh
   ```

3. **Check resource usage:**
   ```bash
   docker stats
   ```

## Security Considerations

1. **Network isolation:** All services run in isolated network
2. **Non-root user:** Application runs as non-privileged user
3. **Security headers:** Nginx adds security headers
4. **Rate limiting:** API protection against abuse
5. **Health checks:** Automatic container health monitoring

## API Usage Examples

### Download YouTube Video

```bash
curl -X POST http://localhost:3001/api/video-download \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'
```

### Access Swagger Documentation

Visit: http://localhost:3001/api/docs

## Support

For issues and questions:
1. Check this documentation
2. Review application logs
3. Check GitHub issues
4. Create new issue with details
