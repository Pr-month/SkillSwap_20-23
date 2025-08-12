import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseFilters,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
// import { MulterExceptionFilter } from './utils/multer-exception.filter';

@Controller('files')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  // @UseFilters(new MulterExceptionFilter())
  uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    console.log('Входящие файлы:', req.files);
    console.log('Загруженный файл:', file);
    if (!file) {
      throw new BadRequestException('no file uploaded');
    }
    try {
      const fileUrl = `${req.protocol}://${req.get('host')}`;
      req.on('close', () => {
        console.log('closed connection');
      });
      return this.uploadService.handleFileUpload(fileUrl, file);
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }
}
