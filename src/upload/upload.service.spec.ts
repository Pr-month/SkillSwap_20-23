/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { UploadService } from './upload.service';
import { BadRequestException } from '@nestjs/common';

describe('UploadService', () => {
  let service: UploadService;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UploadService],
    }).compile();

    service = module.get<UploadService>(UploadService);

    // Mock console.log to avoid output during tests
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    // Restore console.log
    consoleLogSpy.mockRestore();
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleFileUpload', () => {
    const mockFileUrl = 'http://localhost:3000';

    it('should successfully handle file upload with forward slashes', () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test-image.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        destination: 'public/uploads',
        filename: '1234567890-test-image.jpg',
        path: 'public/uploads/1234567890-test-image.jpg',
        size: 1024,
        stream: {} as any,
        buffer: Buffer.from(''),
      };

      const result = service.handleFileUpload(mockFileUrl, mockFile);

      expect(result).toEqual({
        message: 'File uploaded successfully',
        filePath:
          'http://localhost:3000/public/uploads/1234567890-test-image.jpg',
      });
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'public/uploads/1234567890-test-image.jpg',
      );
    });

    it('should normalize backslashes to forward slashes in file path', () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test-image.png',
        encoding: '7bit',
        mimetype: 'image/png',
        destination: 'public\\uploads',
        filename: '1234567890-test-image.png',
        path: 'public\\uploads\\1234567890-test-image.png',
        size: 2048,
        stream: {} as any,
        buffer: Buffer.from(''),
      };

      const result = service.handleFileUpload(mockFileUrl, mockFile);

      expect(result).toEqual({
        message: 'File uploaded successfully',
        filePath:
          'http://localhost:3000/public/uploads/1234567890-test-image.png',
      });
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'public/uploads/1234567890-test-image.png',
      );
    });

    it('should handle mixed slashes in file path', () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test-image.gif',
        encoding: '7bit',
        mimetype: 'image/gif',
        destination: 'public/uploads',
        filename: '1234567890-test-image.gif',
        path: 'public\\uploads/subfolder\\1234567890-test-image.gif',
        size: 4096,
        stream: {} as any,
        buffer: Buffer.from(''),
      };

      const result = service.handleFileUpload(mockFileUrl, mockFile);

      expect(result).toEqual({
        message: 'File uploaded successfully',
        filePath:
          'http://localhost:3000/public/uploads/subfolder/1234567890-test-image.gif',
      });
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'public/uploads/subfolder/1234567890-test-image.gif',
      );
    });

    it('should throw BadRequestException when no file is provided', () => {
      const mockFile = null as any;

      expect(() => service.handleFileUpload(mockFileUrl, mockFile)).toThrow(
        BadRequestException,
      );
      expect(() => service.handleFileUpload(mockFileUrl, mockFile)).toThrow(
        'no file uploaded',
      );
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when file is undefined', () => {
      const mockFile = undefined as any;

      expect(() => service.handleFileUpload(mockFileUrl, mockFile)).toThrow(
        BadRequestException,
      );
      expect(() => service.handleFileUpload(mockFileUrl, mockFile)).toThrow(
        'no file uploaded',
      );
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should handle different file URLs', () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test-image.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        destination: 'uploads',
        filename: 'test.jpg',
        path: 'uploads/test.jpg',
        size: 1024,
        stream: {} as any,
        buffer: Buffer.from(''),
      };

      const httpsUrl = 'https://example.com';
      const result = service.handleFileUpload(httpsUrl, mockFile);

      expect(result).toEqual({
        message: 'File uploaded successfully',
        filePath: 'https://example.com/uploads/test.jpg',
      });
    });

    it('should handle file with special characters in path', () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test image (1).jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        destination: 'public/uploads',
        filename: '1234567890-test_image_1.jpg',
        path: 'public/uploads/1234567890-test_image_1.jpg',
        size: 1024,
        stream: {} as any,
        buffer: Buffer.from(''),
      };

      const result = service.handleFileUpload(mockFileUrl, mockFile);

      expect(result).toEqual({
        message: 'File uploaded successfully',
        filePath:
          'http://localhost:3000/public/uploads/1234567890-test_image_1.jpg',
      });
    });

    it('should handle empty file path', () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        destination: '',
        filename: 'test.jpg',
        path: '',
        size: 1024,
        stream: {} as any,
        buffer: Buffer.from(''),
      };

      const result = service.handleFileUpload(mockFileUrl, mockFile);

      expect(result).toEqual({
        message: 'File uploaded successfully',
        filePath: 'http://localhost:3000/',
      });
      expect(consoleLogSpy).toHaveBeenCalledWith('');
    });

    it('should handle file URL with trailing slash', () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        destination: 'uploads',
        filename: 'test.jpg',
        path: 'uploads/test.jpg',
        size: 1024,
        stream: {} as any,
        buffer: Buffer.from(''),
      };

      const urlWithSlash = 'http://localhost:3000/';
      const result = service.handleFileUpload(urlWithSlash, mockFile);

      expect(result).toEqual({
        message: 'File uploaded successfully',
        filePath: 'http://localhost:3000//uploads/test.jpg',
      });
    });

    it('should handle deeply nested paths', () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        destination: 'public/uploads/2024/01/15',
        filename: 'test.jpg',
        path: 'public\\uploads\\2024\\01\\15\\test.jpg',
        size: 1024,
        stream: {} as any,
        buffer: Buffer.from(''),
      };

      const result = service.handleFileUpload(mockFileUrl, mockFile);

      expect(result).toEqual({
        message: 'File uploaded successfully',
        filePath: 'http://localhost:3000/public/uploads/2024/01/15/test.jpg',
      });
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'public/uploads/2024/01/15/test.jpg',
      );
    });

    it('should handle file with no extension', () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'testfile',
        encoding: '7bit',
        mimetype: 'application/octet-stream',
        destination: 'uploads',
        filename: 'testfile',
        path: 'uploads/testfile',
        size: 1024,
        stream: {} as any,
        buffer: Buffer.from(''),
      };

      const result = service.handleFileUpload(mockFileUrl, mockFile);

      expect(result).toEqual({
        message: 'File uploaded successfully',
        filePath: 'http://localhost:3000/uploads/testfile',
      });
    });

    it('should handle large file sizes', () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'large-image.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        destination: 'uploads',
        filename: 'large-image.jpg',
        path: 'uploads/large-image.jpg',
        size: 10 * 1024 * 1024, // 10MB
        stream: {} as any,
        buffer: Buffer.from(''),
      };

      const result = service.handleFileUpload(mockFileUrl, mockFile);

      expect(result).toEqual({
        message: 'File uploaded successfully',
        filePath: 'http://localhost:3000/uploads/large-image.jpg',
      });
    });

    it('should handle file with unicode characters in path', () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'файл.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        destination: 'uploads',
        filename: '1234567890-file.jpg',
        path: 'uploads/1234567890-file.jpg',
        size: 1024,
        stream: {} as any,
        buffer: Buffer.from(''),
      };

      const result = service.handleFileUpload(mockFileUrl, mockFile);

      expect(result).toEqual({
        message: 'File uploaded successfully',
        filePath: 'http://localhost:3000/uploads/1234567890-file.jpg',
      });
    });

    it('should handle multiple consecutive backslashes', () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        destination: 'uploads',
        filename: 'test.jpg',
        path: 'uploads\\\\subfolder\\\\test.jpg',
        size: 1024,
        stream: {} as any,
        buffer: Buffer.from(''),
      };

      const result = service.handleFileUpload(mockFileUrl, mockFile);

      expect(result).toEqual({
        message: 'File uploaded successfully',
        filePath: 'http://localhost:3000/uploads//subfolder//test.jpg',
      });
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'uploads//subfolder//test.jpg',
      );
    });

    it('should preserve the exact console.log behavior', () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        destination: 'uploads',
        filename: 'test.jpg',
        path: 'test\\path\\file.jpg',
        size: 1024,
        stream: {} as any,
        buffer: Buffer.from(''),
      };

      service.handleFileUpload(mockFileUrl, mockFile);

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenCalledWith('test/path/file.jpg');
    });
  });

  describe('edge cases', () => {
    it('should handle file object with minimal required properties', () => {
      const minimalFile = {
        path: 'minimal/path.jpg',
      } as Express.Multer.File;

      const result = service.handleFileUpload('http://test.com', minimalFile);

      expect(result).toEqual({
        message: 'File uploaded successfully',
        filePath: 'http://test.com/minimal/path.jpg',
      });
    });

    it('should handle file URL with port number', () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        destination: 'uploads',
        filename: 'test.jpg',
        path: 'uploads/test.jpg',
        size: 1024,
        stream: {} as any,
        buffer: Buffer.from(''),
      };

      const result = service.handleFileUpload(
        'http://localhost:8080',
        mockFile,
      );

      expect(result).toEqual({
        message: 'File uploaded successfully',
        filePath: 'http://localhost:8080/uploads/test.jpg',
      });
    });

    it('should handle file URL with subdomain', () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        destination: 'uploads',
        filename: 'test.jpg',
        path: 'uploads/test.jpg',
        size: 1024,
        stream: {} as any,
        buffer: Buffer.from(''),
      };

      const result = service.handleFileUpload(
        'https://api.example.com',
        mockFile,
      );

      expect(result).toEqual({
        message: 'File uploaded successfully',
        filePath: 'https://api.example.com/uploads/test.jpg',
      });
    });
  });
});
