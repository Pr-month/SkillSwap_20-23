import { HttpException, HttpStatus } from '@nestjs/common';
// import { MulterError } from 'multer';

export const imageFileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
): void => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];

  if (!allowedMimes.includes(file.mimetype)) {
    console.log(file);
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

// export const imageFileFilter = (
//   req: Express.Request,
//   file: Express.Multer.File,
//   callback: (error: Error | null, acceptFile: boolean) => void,
// ): void => {
//   const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];
//   console.log(req.files);
//   // console.log(req);
//   if (!allowedMimes.includes(file.mimetype)) {
//     const multerError = new MulterError(
//       'LIMIT_UNEXPECTED_FILE',
//       file.fieldname,
//     );
//     console.log(multerError);
//     return callback(multerError, false);
//   }

//   callback(null, true);
// };
