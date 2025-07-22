import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Module({
  imports: [
    MulterModule.register({
      limits: { fileSize: 2 * 1024 * 1024 },
      storage: diskStorage({
        destination: './public/',
        filename: (req, file, cb) => {
          const filename = `${Date.now()}${file.originalname}`;
          cb(null, filename);
        },
      }),
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
