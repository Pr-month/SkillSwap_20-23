import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { MulterError } from 'multer';
import { Response } from 'express';

@Catch(MulterError)
export class MulterExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(MulterExceptionFilter.name);

  catch(exception: MulterError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    let status = HttpStatus.BAD_REQUEST;
    let message = exception.message;

    switch (exception.code) {
      case 'LIMIT_FILE_SIZE':
        status = HttpStatus.PAYLOAD_TOO_LARGE;
        message = 'Файл слишком большой';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        status = HttpStatus.UNSUPPORTED_MEDIA_TYPE;
        message = 'Разрешены только файлы изображений';
        break;
      case 'LIMIT_FILE_COUNT':
        status = HttpStatus.BAD_REQUEST;
        message = 'Превышено максимальное количество файлов';
        break;
      case 'LIMIT_PART_COUNT':
        status = HttpStatus.BAD_REQUEST;
        message = 'Слишком много частей в запросе';
        break;
      default:
        message = 'Ошибка загрузки файла';
        break;
    }

    this.logger.error(`Multer error: ${exception.code} - ${message}`);

    response.status(status).json({
      statusCode: status,
      message: exception.message || 'Ошибка загрузки файла',
      error: HttpStatus[status],
    });
  }
}
