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
import { MulterExceptionFilter } from './utils/multer-exception.filter';

@Controller('files')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @UseFilters(new MulterExceptionFilter())
  uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    if (!file) {
      throw new BadRequestException(
        'Файл не загружен, или загружен не в том формате',
      );
    }
    const fileUrl = `${req.protocol}://${req.get('host')}`;
    return this.uploadService.handleFileUpload(fileUrl, file);
  }
}
