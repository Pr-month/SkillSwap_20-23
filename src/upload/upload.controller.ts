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
import {
  ApiConsumes,
  ApiBody,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('uploads')
@Controller('files')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @ApiOperation({ summary: 'Загрузка файла' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Файл успешно загружен' })
  @ApiResponse({
    status: 400,
    description: 'Файл не загружен, или загружен не в том формате',
  })
  @ApiResponse({
    status: 409,
    description: 'Файл с таким именем уже существует',
  })
  @ApiResponse({
    status: 413,
    description: 'Размер файла превышает допустимый лимит',
  })
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
