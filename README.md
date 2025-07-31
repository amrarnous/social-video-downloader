# Video Downloader API

A robust NestJS application that provides REST APIs for downloading videos from YouTube, Instagram, Twitter (X), and Facebook. The application implements the Strategy Design Pattern for platform-specific download logic and the Facade Pattern to expose a unified interface for video downloading.

## 🚀 Features

- **Multi-Platform Support**: Download videos from YouTube, Instagram, Twitter (X), and Facebook
- **Design Patterns**: Implements Strategy and Facade patterns for maintainable and extensible code
- **Auto-Detection**: Automatically detects video platform from URL
- **Direct Streaming**: Returns actual video files instead of just URLs
- **API Documentation**: Full Swagger/OpenAPI documentation
- **Type Safety**: Built with TypeScript following NestJS best practices
- **Error Handling**: Comprehensive error handling and input validation

## 🏗️ Architecture

### Design Patterns Used

1. **Strategy Pattern**: Each platform (YouTube, Instagram, Twitter, Facebook) has its own download strategy
2. **Facade Pattern**: `VideoDownloaderFacadeService` provides a unified interface and auto-detects platforms
3. **Dependency Injection**: NestJS DI container manages strategy instances

### Project Structure

```
src/
├── video-download/
│   ├── dto/
│   │   └── download-video.dto.ts          # Request validation DTO
│   ├── video-download-strategy.interface.ts  # Strategy interface
│   ├── youtube-download.strategy.ts          # YouTube implementation
│   ├── instagram-download.strategy.ts        # Instagram implementation
│   ├── twitter-download.strategy.ts          # Twitter implementation
│   ├── facebook-download.strategy.ts         # Facebook implementation
│   ├── video-downloader-facade.service.ts   # Facade service
│   ├── video-download.controller.ts         # REST controller
│   └── video-download.module.ts            # Feature module
├── app.module.ts                           # Root module
└── main.ts                                # Application bootstrap
```

## 📋 Prerequisites

### For Docker Installation (Recommended)
- Docker (version 20.10+)
- Docker Compose (version 2.0+)

### For Local Development
- Node.js (v18+ recommended)
- npm or yarn
- Git
- Python 3 (for youtube-dl dependencies)
- FFmpeg (for video processing)

## 🛠️ Installation

### Option 1: Docker (Recommended)

**Prerequisites:**
- Docker (version 20.10+)
- Docker Compose (version 2.0+)

#### Development Environment
```bash
# Clone the repository
git clone <repository-url>
cd youtube-downloader

# Start development environment with hot reload
docker-compose -f docker-compose.dev.yml up --build

# Access the application
# API: http://localhost:3001
# Swagger Documentation: http://localhost:3001/api/docs
```

#### Production Environment
```bash
# Start production environment
docker-compose -f docker-compose.prod.yml up -d --build

# Check service status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

#### With Additional Services
```bash
# Start with Redis caching
docker-compose --profile cache up -d

# Start with Nginx reverse proxy
docker-compose --profile proxy up -d

# Start with both Redis and Nginx
docker-compose --profile cache --profile proxy up -d
```

### Option 2: Local Development

**Prerequisites:**
- Node.js (version 18+)
- npm or yarn
- Git
- Python 3 (for youtube-dl dependencies)
- FFmpeg (for video processing)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd youtube-downloader
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run start:dev
   ```

4. **Access the application**
   - API: http://localhost:3001
   - Swagger Documentation: http://localhost:3001/api/docs

> 📖 **For detailed Docker instructions, see [DOCKER.md](./DOCKER.md)**

## 📚 API Documentation

### Base URL
```
http://localhost:3001
```

### Endpoints

#### Download Video
**POST** `/api/download`

Downloads a video from supported platforms and streams it directly to the client.

**Request Body:**
```json
{
  "url": "https://youtube.com/watch?v=abc123"
}
```

**Supported URL Formats:**
- **YouTube**: `https://youtube.com/watch?v=...` or `https://youtu.be/...`
- **Instagram**: `https://instagram.com/p/...` or `https://instagram.com/reel/...`
- **Twitter/X**: `https://twitter.com/.../status/...` or `https://x.com/.../status/...`
- **Facebook**: `https://facebook.com/.../videos/...` or `https://fb.watch/...`

**Response:**
- **Success**: Returns the video file as a download stream
- **Error**: Returns JSON with error details

**Success Response (File Download):**
```
Content-Type: video/mp4
Content-Disposition: attachment; filename="video_title.mp4"
[Binary video data]
```

**Error Response:**
```json
{
  "status": "error",
  "platform": "youtube",
  "error": "Failed to fetch video info"
}
```

## 🔧 Usage Examples

### Using cURL

```bash
# Download a YouTube video
curl -X POST http://localhost:3001/api/download \
  -H "Content-Type: application/json" \
  -d '{"url": "https://youtube.com/watch?v=dQw4w9WgXcQ"}' \
  --output video.mp4

# Download an Instagram video
curl -X POST http://localhost:3001/api/download \
  -H "Content-Type: application/json" \
  -d '{"url": "https://instagram.com/p/ABC123/"}' \
  --output instagram_video.mp4
```

### Using JavaScript/Fetch

```javascript
const downloadVideo = async (url) => {
  try {
    const response = await fetch('http://localhost:3001/api/download', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (response.ok) {
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = 'video.mp4';
      a.click();
    } else {
      const error = await response.json();
      console.error('Download failed:', error);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};

// Usage
downloadVideo('https://youtube.com/watch?v=dQw4w9WgXcQ');
```

### Using Python

```python
import requests

def download_video(url, filename):
    try:
        response = requests.post(
            'http://localhost:3001/api/download',
            json={'url': url},
            stream=True
        )
        
        if response.status_code == 200:
            with open(filename, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            print(f"Video downloaded successfully: {filename}")
        else:
            error = response.json()
            print(f"Download failed: {error}")
    except Exception as e:
        print(f"Error: {e}")

# Usage
download_video('https://youtube.com/watch?v=dQw4w9WgXcQ', 'video.mp4')
```

## 🚀 Production Deployment

### Build for Production

```bash
# Build the application
npm run build

# Start production server
npm run start:prod
```

### Environment Variables

Create a `.env` file for production configuration:

```env
PORT=3001
NODE_ENV=production
```

### Docker Deployment (Optional)

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 3001

CMD ["npm", "run", "start:prod"]
```

Build and run:

```bash
docker build -t video-downloader .
docker run -p 3001:3001 video-downloader
```

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run end-to-end tests
npm run test:e2e
```

## 📝 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Build the application for production |
| `npm run start` | Start the application |
| `npm run start:dev` | Start in development mode with hot reload |
| `npm run start:debug` | Start in debug mode |
| `npm run start:prod` | Start the production build |
| `npm run lint` | Run ESLint and fix issues |
| `npm run format` | Format code with Prettier |
| `npm run test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:cov` | Run tests with coverage report |
| `npm run test:e2e` | Run end-to-end tests |

## 🔍 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   Error: listen EADDRINUSE: address already in use :::3001
   ```
   **Solution**: Change the port in `main.ts` or kill the process using the port.

2. **YouTube Download Fails**
   ```json
   {"status": "error", "platform": "youtube", "error": "Sign in to confirm you're not a bot"}
   ```
   **Solution**: YouTube has anti-bot protection. Try:
   - Using a different public video URL
   - Waiting a few minutes before retrying
   - The app automatically tries fallback methods
   - Some videos may be region-locked or have restrictions

   ```json
   {"status": "error", "platform": "youtube", "error": "Failed to fetch video info"}
   ```
   **Solution**: The video might be private, age-restricted, or region-locked. Try with a different public video.

3. **Instagram/Facebook Download Fails**
   **Solution**: These platforms frequently change their APIs. The `youtube-dl-exec` library may need updates.

### Debug Mode

Start the application in debug mode to see detailed logs:

```bash
npm run start:debug
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Adding New Platform Support

To add support for a new platform:

1. Create a new strategy class implementing `VideoDownloadStrategy`
2. Add the strategy to `VideoDownloaderFacadeService`
3. Update the platform detection logic
4. Add the platform to the controller's streaming logic
5. Update documentation

Example:

```typescript
// tiktok-download.strategy.ts
export class TiktokDownloadStrategy implements VideoDownloadStrategy {
  async download(url: string) {
    // Implementation for TikTok
  }
}
```

## 📄 License

This project is licensed under the UNLICENSED License.

## 🙏 Acknowledgments

- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [@distube/ytdl-core](https://github.com/distube/ytdl-core) - YouTube video downloader
- [youtube-dl-exec](https://github.com/microlinkhq/youtube-dl-exec) - Multi-platform video downloader
- [Swagger/OpenAPI](https://swagger.io/) - API documentation

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Note**: This application is for educational purposes. Please respect the terms of service of the platforms you're downloading from and ensure you have the right to download the content.
