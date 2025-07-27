import { registerAs } from '@nestjs/config';

export const configuration = registerAs('APP_CONFIG', () => ({
  port: Number(process.env.PORT) || 3000,
  fileUploads: {
    destination: process.env.FILE_UPLOAD_DEST || './public/uploads',
    limit: parseInt(process.env.FILE_UPLOAD_LIMIT || '2097152', 10),
  },
}));
