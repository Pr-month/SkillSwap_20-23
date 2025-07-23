import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

const logDir = 'logs'; // папка для хранения логов

@Injectable()
export class WinstonLogger implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    // конфигурация логгера
    this.logger = winston.createLogger({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      format: winston.format.combine(
        // форматирование логов
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // добавляет временную метку в указанном формате
        winston.format.errors({ stack: true }), // включает стек вызовов для ошибок
        winston.format.splat(), // обеспечивает поддержку интерполяции строк
        winston.format.json(), // форматирует лог в JSON (для файлов)
      ),
      defaultMeta: { service: 'nestjs-app' },
      transports: [
        // консоль куда пишутся логи, форматированный вывод с цветами
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(
              ({ timestamp, level, message, context, stack }) => {
                const contextMsg = context ? `[${String(context)}] ` : ''; // Явное преобразование в строку
                const stackMsg = stack ? `\n${String(stack)}` : ''; // Явное преобразование в строку
                return `${timestamp} ${level}: ${contextMsg}${String(message)}${stackMsg}`;
              },
            ),
          ),
        }),
        // файлы с ротацией
        new DailyRotateFile({
          // для ошибок
          dirname: `${logDir}/error`,
          filename: 'error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '30d',
          level: 'error',
        }),
        new DailyRotateFile({
          // общие логи 
          dirname: `${logDir}/combined`,
          filename: 'combined-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '30d',
        }),
      ],
      // обработка исключений
      exceptionHandlers: [
        new DailyRotateFile({
          dirname: `${logDir}/exceptions`,
          filename: 'exceptions-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '30d',
        }),
      ],
    });

    // особенности для development режима
    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
          ),
          level: 'debug',
        }),
      );
    }
  }

  // реализация методов LoggerService
  log(message: unknown, context?: string) {
    this.logger.info(String(message), { context });
  }

  error(message: unknown, trace?: string, context?: string) {
    this.logger.error(String(message), { stack: trace, context });
  }

  warn(message: unknown, context?: string) {
    this.logger.warn(String(message), { context });
  }

  debug(message: unknown, context?: string) {
    this.logger.debug(String(message), { context });
  }

  verbose(message: unknown, context?: string) {
    this.logger.verbose(String(message), { context });
  }
}