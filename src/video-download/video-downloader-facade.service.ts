import { Injectable } from '@nestjs/common';
import { VideoDownloadStrategy } from './video-download-strategy.interface';
import { YoutubeDownloadStrategy } from './youtube-download.strategy';
import { InstagramDownloadStrategy } from './instagram-download.strategy';
import { TwitterDownloadStrategy } from './twitter-download.strategy';
import { FacebookDownloadStrategy } from './facebook-download.strategy';

@Injectable()
export class VideoDownloaderFacadeService {
  private readonly strategies: Record<string, VideoDownloadStrategy>;

  constructor() {
    this.strategies = {
      youtube: new YoutubeDownloadStrategy(),
      instagram: new InstagramDownloadStrategy(),
      twitter: new TwitterDownloadStrategy(),
      facebook: new FacebookDownloadStrategy(),
    };
  }

  private detectPlatform(url: string): string | null {
    if (/youtube\.com|youtu\.be/.test(url)) return 'youtube';
    if (/instagram\.com/.test(url)) return 'instagram';
    if (/twitter\.com|x\.com/.test(url)) return 'twitter';
    if (/facebook\.com|fb\.watch/.test(url)) return 'facebook';
    return null;
  }

  async download(url: string) {
    const platform = this.detectPlatform(url);
    if (!platform) {
      return {
        status: 'error',
        platform: 'unknown',
        error: 'Unsupported or invalid URL',
      };
    }
    const result = await this.strategies[platform].download(url);
    // For YouTube, ensure title is present for controller
    if (platform === 'youtube' && !('title' in result)) {
      result.title = 'video';
    }
    return result;
  }
}
