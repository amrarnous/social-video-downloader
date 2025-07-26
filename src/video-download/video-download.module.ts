import { Module } from '@nestjs/common';
import { VideoDownloadController } from './video-download.controller';
import { VideoDownloaderFacadeService } from './video-downloader-facade.service';

@Module({
  controllers: [VideoDownloadController],
  providers: [VideoDownloaderFacadeService],
})
export class VideoDownloadModule {}
