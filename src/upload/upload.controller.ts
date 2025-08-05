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
import { imageFileFilter } from './utils/image-file-filter';

@Controller('files')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: imageFileFilter,
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    const fileUrl = `${req.protocol}://${req.get('host')}`;
    console.log(file);
    return this.uploadService.handleFileUpload(fileUrl, file);
  }
}
