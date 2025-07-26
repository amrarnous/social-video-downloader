import { VideoDownloadStrategy } from './video-download-strategy.interface';
const ytdl = require('@distube/ytdl-core');

export class YoutubeDownloadStrategy implements VideoDownloadStrategy {
  async download(url: string): Promise<{ status: string; platform: string; downloadUrl?: string; error?: string; title?: string }> {
    if (!ytdl.validateURL(url)) {
      return {
        status: 'error',
        platform: 'youtube',
        error: 'Invalid YouTube URL',
        title: 'video',
      };
    }
    try {
      // Use agent with custom headers to avoid bot detection
      const agent = ytdl.createAgent();
      const info = await ytdl.getInfo(url, {
        agent,
        requestOptions: {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
          }
        }
      });
      
      const format = ytdl.chooseFormat(info.formats, { 
        quality: 'highest',
        filter: 'audioandvideo'
      });
      
      return {
        status: 'success',
        platform: 'youtube',
        downloadUrl: format.url,
        title: info.videoDetails.title,
      };
    } catch (error) {
      console.error('YouTube download error:', error);
      
      // If primary method fails, try fallback with youtube-dl-exec
      try {
        const youtubedl = require('youtube-dl-exec');
        const result = await youtubedl(url, {
          dumpSingleJson: true,
          noCheckCertificate: true,
          preferFreeFormats: true,
          youtubeSkipDashManifest: true,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        });
        
        if (result && result.url) {
          return {
            status: 'success',
            platform: 'youtube',
            downloadUrl: result.url,
            title: result.title || 'youtube_video',
          };
        }
        
        if (result && result.formats && result.formats.length > 0) {
          return {
            status: 'success',
            platform: 'youtube',
            downloadUrl: result.formats[0].url,
            title: result.title || 'youtube_video',
          };
        }
      } catch (fallbackError) {
        console.error('YouTube fallback error:', fallbackError);
      }
      
      return {
        status: 'error',
        platform: 'youtube',
        error: error?.message || String(error) || 'Failed to fetch video info',
        title: 'video',
      };
    }
  }
}
