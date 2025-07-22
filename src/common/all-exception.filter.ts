import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { MulterError } from 'multer';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    // Если это стандартный HttpException
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message = typeof res === 'string' ? res : (res as any).message || message;
    }
    // Если ошибка multer (например, слишком большой файл)
    else if (exception instanceof MulterError) {
      if (exception.code === 'LIMIT_FILE_SIZE') {
        status = HttpStatus.PAYLOAD_TOO_LARGE; // 413
        message = 'File size exceeds the allowed limit';
      } else {
        // Другие ошибки multer
        status = HttpStatus.BAD_REQUEST;
        message = exception.message;
      }
    }
    // Если ошибка Postgres (например, дубликат ключа)
    else if (exception instanceof Error) {
      // Приведём exception к any чтобы проверить свойство code
      const err = exception as any;

      if (err.code === '23505') {
        status = HttpStatus.CONFLICT; // 409
        message = 'Duplicate key error';
      } else {
        message = err.message || message;
      }
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

// При ошибке дубликата возвращается код ответа 409
// При загрузке слишком большого файла возвращается код ответа 413
