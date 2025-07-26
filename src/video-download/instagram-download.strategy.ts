import { VideoDownloadStrategy } from './video-download-strategy.interface';
const youtubedl = require('youtube-dl-exec');

export class InstagramDownloadStrategy implements VideoDownloadStrategy {
  async download(url: string): Promise<{ status: string; platform: string; downloadUrl?: string; error?: string }> {
    try {
      const result = await youtubedl(url, {
        dumpSingleJson: true,
        noCheckCertificate: true,
        preferFreeFormats: true,
        youtubeSkipDashManifest: true,
      });
      if (result && result.url) {
        return {
          status: 'success',
          platform: 'instagram',
          downloadUrl: result.url,
        };
      }
      if (result && result.formats && result.formats.length > 0) {
        return {
          status: 'success',
          platform: 'instagram',
          downloadUrl: result.formats[0].url,
        };
      }
      return {
        status: 'error',
        platform: 'instagram',
        error: 'No downloadable video found',
      };
    } catch (error) {
      return {
        status: 'error',
        platform: 'instagram',
        error: 'Failed to fetch video info',
      };
    }
  }
}
