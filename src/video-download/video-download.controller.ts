import { Controller, Post, Body, Res, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { VideoDownloaderFacadeService } from './video-downloader-facade.service';
import { DownloadVideoDto } from './dto/download-video.dto';
import { Response } from 'express';

@ApiTags('Video Download')
@Controller('api/download')
export class VideoDownloadController {
  constructor(private readonly facade: VideoDownloaderFacadeService) {}

  @Post()
  @ApiOperation({ summary: 'Download a video from YouTube, Instagram, Twitter (X), or Facebook' })
  @ApiBody({ type: DownloadVideoDto })
  @ApiResponse({ status: 200, description: 'Download result', schema: { example: { status: 'success', platform: 'youtube', downloadUrl: 'https://...' } } })
  @ApiResponse({ status: 400, description: 'Invalid URL or unsupported platform' })
  async download(@Body() body: DownloadVideoDto, @Res() res: Response) {
    const result = await this.facade.download(body.url);
    if (result.status === 'success' && result.downloadUrl) {
      // For YouTube, try to stream the video directly, but fall back to URL streaming
      if (result.platform === 'youtube') {
        // Since ytdl-core is having issues, use the extracted URL directly
        console.log('[Controller] YouTube: Using extracted URL for streaming');
        
        const https = require('https');
        const http = require('http');
        const url = require('url');
        
        const parsedUrl = url.parse(result.downloadUrl);
        const client = parsedUrl.protocol === 'https:' ? https : http;
        
        const sanitizedTitle = (result.title || 'video').replace(/[^a-zA-Z0-9\s\-_]/g, '').trim();
        res.setHeader('Content-Disposition', `attachment; filename="${sanitizedTitle}.mp4"`);
        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        
        const request = client.get(result.downloadUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Referer': 'https://www.youtube.com/'
          }
        }, (videoResponse: any) => {
          videoResponse.pipe(res);
        });
        
        request.on('error', (error: any) => {
          console.error('[Controller] YouTube download error:', error);
          return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            status: 'error',
            platform: result.platform,
            error: 'Failed to download YouTube video'
          });
        });
        return;
      }
      // For Instagram/Twitter/Facebook, stream the video from the URL
      if (result.platform === 'instagram' || result.platform === 'twitter' || result.platform === 'facebook') {
        const https = require('https');
        const http = require('http');
        const url = require('url');
        
        const parsedUrl = url.parse(result.downloadUrl);
        const client = parsedUrl.protocol === 'https:' ? https : http;
        
        const sanitizedTitle = `${result.platform}_video`;
        res.setHeader('Content-Disposition', `attachment; filename="${sanitizedTitle}.mp4"`);
        res.setHeader('Content-Type', 'video/mp4');
        
        const request = client.get(result.downloadUrl, (videoResponse: any) => {
          videoResponse.pipe(res);
        });
        
        request.on('error', (error: any) => {
          console.error('Download error:', error);
          return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            status: 'error',
            platform: result.platform,
            error: 'Failed to download video'
          });
        });
        return;
      }
      // For other platforms, return JSON response
      return res.status(HttpStatus.OK).json(result);
    }
    return res.status(HttpStatus.BAD_REQUEST).json(result);
  }

  @Post('telegram')
  @ApiOperation({ summary: 'Get video information for Telegram Bot integration via n8n' })
  @ApiBody({ type: DownloadVideoDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Video information for Telegram', 
    schema: { 
      example: { 
        video: 'https://example.com/video.mp4',
        caption: 'Video Title',
        filename: 'video.mp4',
        title: 'Video Title',
        platform: 'youtube',
        status: 'success'
      } 
    } 
  })
  @ApiResponse({ status: 400, description: 'Invalid URL or unsupported platform' })
  async downloadForTelegram(@Body() body: DownloadVideoDto) {
    const result = await this.facade.download(body.url);
    
    if (result.status === 'success' && result.downloadUrl) {
      const sanitizedTitle = (result.title || 'video').replace(/[^a-zA-Z0-9\s\-_]/g, '').trim();
      const filename = `${sanitizedTitle}.mp4`;
      
      return {
        video: result.downloadUrl,
        caption: result.title || `Video from ${result.platform}`,
        filename: filename,
        title: result.title,
        platform: result.platform,
        status: 'success'
      };
    }
    
    return {
      status: 'error',
      platform: result.platform,
      error: result.error || 'Failed to process video',
      video: null,
      caption: null,
      filename: null,
      title: null
    };
  }
}
