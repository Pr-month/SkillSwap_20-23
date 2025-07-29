import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Req,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';

@Controller('files')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    const fileUrl = `${req.protocol}://${req.get('host')}`;
    return this.uploadService.handleFileUpload(fileUrl, file);
  }
}
