import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class UploadService {
  handleFileUpload(fileUrl: string, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('no file uploaded');
    }
    const normalizedPath = file.path.replace(/\\/g, '/');
    console.log(file);
    return {
      message: 'File uploaded successfully',
      filePath: `${fileUrl}/${normalizedPath}`,
    };
  }
}
