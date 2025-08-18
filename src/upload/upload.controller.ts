import {
  BadRequestException,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { UploadService } from './upload.service';
import { imageFileFilter } from './utils/image-file-filter';

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
    if (!file) {
      throw new BadRequestException(
        'Файл не загружен, или загружен не в том формате',
      );
    }
    const fileUrl = `${req.protocol}://${req.get('host')}`;
    return this.uploadService.handleFileUpload(fileUrl, file);
  }
}
