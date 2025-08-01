import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VideoDownloadModule } from './video-download/video-download.module';

@Module({
  imports: [VideoDownloadModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
