import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';

// Функция фильтрации файлов
// TODO: может нужно будет вынести в отдельный файл.
const imageFileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
): void => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];

  if (!allowedMimes.includes(file.mimetype)) {
    return callback(
      new HttpException(
        'Разрешены только изображения!',
        HttpStatus.BAD_REQUEST,
      ),
      false,
    );
  }

  callback(null, true);
};

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
    return this.uploadService.handleFileUpload(fileUrl, file);
  }
}