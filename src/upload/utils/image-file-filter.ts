import { MulterError } from 'multer';

export const imageFileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
): void => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!allowedMimes.includes(file.mimetype)) {
    const errorMessage = new MulterError(
      'LIMIT_UNEXPECTED_FILE',
      file.fieldname,
    );
    console.log(errorMessage);
    return callback(null, false);
  }
  callback(null, true);
};
