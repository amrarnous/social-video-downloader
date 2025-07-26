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

    // Try fallback method first (more reliable)
    try {
      console.log('[YouTube] Trying youtube-dl-exec method first...');
      const youtubedl = require('youtube-dl-exec');
      const result = await youtubedl(url, {
        dumpSingleJson: true,
        noCheckCertificate: true,
        preferFreeFormats: true,
        youtubeSkipDashManifest: true,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        addHeader: [
          'Accept-Language:en-US,en;q=0.9',
          'Accept:text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
        ]
      });
      
      if (result && result.url) {
        console.log('[YouTube] Successfully extracted using youtube-dl-exec');
        return {
          status: 'success',
          platform: 'youtube',
          downloadUrl: result.url,
          title: result.title || 'youtube_video',
        };
      }
      
      if (result && result.formats && result.formats.length > 0) {
        // Find the best quality format
        const videoFormats = result.formats.filter((f: any) => f.vcodec !== 'none' && f.url);
        if (videoFormats.length > 0) {
          const bestFormat = videoFormats.find((f: any) => f.height >= 720) || videoFormats[0];
          console.log('[YouTube] Successfully extracted using youtube-dl-exec (formats)');
          return {
            status: 'success',
            platform: 'youtube',
            downloadUrl: bestFormat.url,
            title: result.title || 'youtube_video',
          };
        }
      }
    } catch (fallbackError) {
      console.log('[YouTube] youtube-dl-exec failed, trying ytdl-core...', fallbackError.message);
    }

    // Try ytdl-core as secondary method
    try {
      console.log('[YouTube] Trying ytdl-core method...');
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
      
      console.log('[YouTube] Successfully extracted using ytdl-core');
      return {
        status: 'success',
        platform: 'youtube',
        downloadUrl: format.url,
        title: info.videoDetails.title,
      };
    } catch (error) {
      console.error('[YouTube] ytdl-core error:', error.message);
      
      return {
        status: 'error',
        platform: 'youtube',
        error: 'YouTube video extraction failed. This video may be region-locked, private, or YouTube has updated their system. Please try a different video.',
        title: 'video',
      };
    }
  }
}
