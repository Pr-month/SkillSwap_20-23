import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { diskStorage } from 'multer';
import { Request } from 'express';
import { extname } from 'path';

export interface IFileUploadeConfig {
  destination: string;
  limit: number;
}

@Module({
  imports: [
    ConfigModule,
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const fileUploadConfig = config.get<IFileUploadeConfig>(
          'APP_CONFIG.fileUploads',
        );
        return {
          limits: {
            fileSize: fileUploadConfig?.limit,
          },
          storage: diskStorage({
            destination: fileUploadConfig?.destination,
            filename: (
              req: Request,
              file: Express.Multer.File,
              cb: (error: Error | null, filename: string) => void,
            ): void => {
              const ext = extname(file.originalname);
              const baseName = file.originalname
                .replace(ext, '')
                .replace(/[^a-zA-Z0-9-_]/g, '_');
              const uniqueName = `${Date.now()}${baseName}${ext}`;
              cb(null, uniqueName);
            },
          }),
        };
      },
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
