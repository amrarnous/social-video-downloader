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
      const info = await ytdl.getInfo(url);
      const format = ytdl.chooseFormat(info.formats, { quality: 'highest' });
      return {
        status: 'success',
        platform: 'youtube',
        downloadUrl: format.url,
        title: info.videoDetails.title,
      };
    } catch (error) {
      console.error('YouTube download error:', error);
      return {
        status: 'error',
        platform: 'youtube',
        error: error?.message || String(error) || 'Failed to fetch video info',
        title: 'video',
      };
    }
  }
}
