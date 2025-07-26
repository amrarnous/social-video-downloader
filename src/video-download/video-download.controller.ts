import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
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
      // For YouTube, stream the video directly
      if (result.platform === 'youtube') {
        const ytdl = require('@distube/ytdl-core');
        const sanitizedTitle = (result.title || 'video').replace(/[^a-zA-Z0-9\s\-_]/g, '').trim();
        res.setHeader('Content-Disposition', `attachment; filename="${sanitizedTitle}.mp4"`);
        res.setHeader('Content-Type', 'video/mp4');
        ytdl(body.url, { quality: 'highest' }).pipe(res);
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
}
