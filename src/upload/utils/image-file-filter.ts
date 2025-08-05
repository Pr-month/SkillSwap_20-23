import { HttpException, HttpStatus } from '@nestjs/common';

export const imageFileFilter = (
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
