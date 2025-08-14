import { Injectable } from '@nestjs/common';

@Injectable()
export class UploadService {
  handleFileUpload(fileUrl: string, file: Express.Multer.File) {
    const normalizedPath = file.path.replace(/\\/g, '/');

    return {
      message: 'File uploaded successfully',
      filePath: `${fileUrl}/${normalizedPath}`,
    };
  }
}
