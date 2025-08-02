import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('APP', () => ({
  port: Number(process.env.PORT) || 3000,
  env: process.env.NODE_ENV || 'development',
  fileUploads: {
    destination: process.env.FILE_UPLOAD_DEST || './public/uploads',
    limit: parseInt(process.env.FILE_UPLOAD_LIMIT || '2097152', 10),
  },
}));
