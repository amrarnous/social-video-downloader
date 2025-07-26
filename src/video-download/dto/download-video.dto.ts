import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl } from 'class-validator';

export class DownloadVideoDto {
  @ApiProperty({ example: 'https://youtube.com/watch?v=abc123', description: 'Video URL to download from YouTube, Instagram, Twitter (X), or Facebook' })
  @IsString()
  @IsUrl({ require_protocol: true })
  url: string;
}
