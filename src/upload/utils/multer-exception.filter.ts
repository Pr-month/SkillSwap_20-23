import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { MulterError } from 'multer';
import { Response } from 'express';

@Catch(MulterError, Error)
export class MulterExceptionFilter implements ExceptionFilter {
  catch(exception: MulterError | Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof MulterError) {
      let status = HttpStatus.BAD_REQUEST;
      let message = exception.message;
      console.log(exception);

      if (exception.code === 'LIMIT_FILE_SIZE') {
        status = HttpStatus.PAYLOAD_TOO_LARGE;
        message = 'Файл слишком большой';
      } else if (exception.code === 'LIMIT_UNEXPECTED_FILE') {
        status = HttpStatus.BAD_REQUEST;
        message = 'Недопустимое поле в запросе на загрузку файла';
      }

      return response.status(status).json({
        statusCode: status,
        message,
        error: 'Bad Request',
      });
    }

    return response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      message: exception.message || 'Ошибка загрузки файла',
      error: 'Bad Request',
    });
  }
}
