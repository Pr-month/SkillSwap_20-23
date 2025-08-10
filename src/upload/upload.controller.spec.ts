/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { BadRequestException } from '@nestjs/common';
import { Request } from 'express';

describe('UploadController', () => {
  let controller: UploadController;
  let uploadService: UploadService;
  let consoleLogSpy: jest.SpyInstance;

  const mockUploadService = {
    handleFileUpload: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
      providers: [
        {
          provide: UploadService,
          useValue: mockUploadService,
        },
      ],
    }).compile();

    controller = module.get<UploadController>(UploadController);
    uploadService = module.get<UploadService>(UploadService);

    // Mock console.log to avoid output during tests
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore console.log
    consoleLogSpy.mockRestore();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadFile', () => {
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

    const createMockRequest = (
      protocol = 'http',
      host = 'localhost:3000',
    ): Partial<Request> => ({
      protocol,
      get: jest.fn().mockImplementation((header: string) => {
        if (header.toLowerCase() === 'host') {
          return host;
        }
        return undefined;
      }),
    });

    it('should successfully upload a file', () => {
      const mockRequest = createMockRequest() as Request;
      const expectedResult = {
        message: 'File uploaded successfully',
        filePath:
          'http://localhost:3000/public/uploads/1234567890-test-image.jpg',
      };

      mockUploadService.handleFileUpload.mockReturnValue(expectedResult);

      const result = controller.uploadFile(mockFile, mockRequest);

      expect(result).toEqual(expectedResult);
      expect(uploadService.handleFileUpload).toHaveBeenCalledWith(
        'http://localhost:3000',
        mockFile,
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(mockFile);
      expect(mockRequest.get).toHaveBeenCalledWith('host');
    });

    it('should handle HTTPS protocol', () => {
      const mockRequest = createMockRequest('https', 'example.com') as Request;
      const expectedResult = {
        message: 'File uploaded successfully',
        filePath:
          'https://example.com/public/uploads/1234567890-test-image.jpg',
      };

      mockUploadService.handleFileUpload.mockReturnValue(expectedResult);

      const result = controller.uploadFile(mockFile, mockRequest);

      expect(result).toEqual(expectedResult);
      expect(uploadService.handleFileUpload).toHaveBeenCalledWith(
        'https://example.com',
        mockFile,
      );
    });

    it('should handle different host with port', () => {
      const mockRequest = createMockRequest(
        'http',
        'api.example.com:8080',
      ) as Request;
      const expectedResult = {
        message: 'File uploaded successfully',
        filePath:
          'http://api.example.com:8080/public/uploads/1234567890-test-image.jpg',
      };

      mockUploadService.handleFileUpload.mockReturnValue(expectedResult);

      const result = controller.uploadFile(mockFile, mockRequest);

      expect(result).toEqual(expectedResult);
      expect(uploadService.handleFileUpload).toHaveBeenCalledWith(
        'http://api.example.com:8080',
        mockFile,
      );
    });

    it('should log the file object', () => {
      const mockRequest = createMockRequest() as Request;
      mockUploadService.handleFileUpload.mockReturnValue({
        message: 'success',
        filePath: 'path',
      });

      controller.uploadFile(mockFile, mockRequest);

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenCalledWith(mockFile);
    });

    it('should handle when file is null', () => {
      const mockRequest = createMockRequest() as Request;
      const nullFile = null as any;

      mockUploadService.handleFileUpload.mockImplementation(() => {
        throw new BadRequestException('no file uploaded');
      });

      expect(() => controller.uploadFile(nullFile, mockRequest)).toThrow(
        BadRequestException,
      );
      expect(uploadService.handleFileUpload).toHaveBeenCalledWith(
        'http://localhost:3000',
        null,
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(null);
    });

    it('should handle when file is undefined', () => {
      const mockRequest = createMockRequest() as Request;
      const undefinedFile = undefined as any;

      mockUploadService.handleFileUpload.mockImplementation(() => {
        throw new BadRequestException('no file uploaded');
      });

      expect(() => controller.uploadFile(undefinedFile, mockRequest)).toThrow(
        BadRequestException,
      );
      expect(uploadService.handleFileUpload).toHaveBeenCalledWith(
        'http://localhost:3000',
        undefined,
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(undefined);
    });

    it('should handle service errors', () => {
      const mockRequest = createMockRequest() as Request;
      const error = new Error('Service error');

      mockUploadService.handleFileUpload.mockImplementation(() => {
        throw error;
      });

      expect(() => controller.uploadFile(mockFile, mockRequest)).toThrow(error);
      expect(uploadService.handleFileUpload).toHaveBeenCalledWith(
        'http://localhost:3000',
        mockFile,
      );
    });

    it('should handle request with custom headers', () => {
      const mockRequest = {
        protocol: 'https',
        get: jest.fn().mockImplementation((header: string) => {
          if (header.toLowerCase() === 'host') {
            return 'custom-domain.com';
          }
          if (header.toLowerCase() === 'x-forwarded-proto') {
            return 'https';
          }
          return undefined;
        }),
      } as unknown as Request;

      const expectedResult = {
        message: 'File uploaded successfully',
        filePath: 'https://custom-domain.com/public/uploads/test.jpg',
      };

      mockUploadService.handleFileUpload.mockReturnValue(expectedResult);

      const result = controller.uploadFile(mockFile, mockRequest);

      expect(result).toEqual(expectedResult);
      expect(uploadService.handleFileUpload).toHaveBeenCalledWith(
        'https://custom-domain.com',
        mockFile,
      );
    });

    it('should handle different file types', () => {
      const mockRequest = createMockRequest() as Request;
      const pngFile: Express.Multer.File = {
        ...mockFile,
        originalname: 'test-image.png',
        mimetype: 'image/png',
        filename: '1234567890-test-image.png',
        path: 'public/uploads/1234567890-test-image.png',
      };

      const expectedResult = {
        message: 'File uploaded successfully',
        filePath:
          'http://localhost:3000/public/uploads/1234567890-test-image.png',
      };

      mockUploadService.handleFileUpload.mockReturnValue(expectedResult);

      const result = controller.uploadFile(pngFile, mockRequest);

      expect(result).toEqual(expectedResult);
      expect(uploadService.handleFileUpload).toHaveBeenCalledWith(
        'http://localhost:3000',
        pngFile,
      );
    });

    it('should handle large files', () => {
      const mockRequest = createMockRequest() as Request;
      const largeFile: Express.Multer.File = {
        ...mockFile,
        size: 10 * 1024 * 1024, // 10MB
      };

      const expectedResult = {
        message: 'File uploaded successfully',
        filePath: 'http://localhost:3000/public/uploads/large-file.jpg',
      };

      mockUploadService.handleFileUpload.mockReturnValue(expectedResult);

      const result = controller.uploadFile(largeFile, mockRequest);

      expect(result).toEqual(expectedResult);
      expect(uploadService.handleFileUpload).toHaveBeenCalledWith(
        'http://localhost:3000',
        largeFile,
      );
    });

    it('should handle request without host header', () => {
      const mockRequest = {
        protocol: 'http',
        get: jest.fn().mockReturnValue(undefined),
      } as unknown as Request;

      const expectedResult = {
        message: 'File uploaded successfully',
        filePath: 'http://undefined/public/uploads/test.jpg',
      };

      mockUploadService.handleFileUpload.mockReturnValue(expectedResult);

      const result = controller.uploadFile(mockFile, mockRequest);

      expect(result).toEqual(expectedResult);
      expect(uploadService.handleFileUpload).toHaveBeenCalledWith(
        'http://undefined',
        mockFile,
      );
    });

    it('should preserve the exact order of operations', () => {
      const mockRequest = createMockRequest() as Request;
      const callOrder: string[] = [];

      // Mock console.log to track call order
      consoleLogSpy.mockImplementation(() => {
        callOrder.push('console.log');
      });

      // Mock service to track call order
      mockUploadService.handleFileUpload.mockImplementation(() => {
        callOrder.push('handleFileUpload');
        return { message: 'success', filePath: 'path' };
      });

      // Mock request.get to track call order
      (mockRequest.get as jest.Mock).mockImplementation((header: string) => {
        callOrder.push(`request.get(${header})`);
        return 'localhost:3000';
      });

      controller.uploadFile(mockFile, mockRequest);

      expect(callOrder).toEqual([
        'request.get(host)',
        'console.log',
        'handleFileUpload',
      ]);
    });

    it('should handle IPv6 addresses in host', () => {
      const mockRequest = createMockRequest('http', '[::1]:3000') as Request;
      const expectedResult = {
        message: 'File uploaded successfully',
        filePath: 'http://[::1]:3000/public/uploads/test.jpg',
      };

      mockUploadService.handleFileUpload.mockReturnValue(expectedResult);

      const result = controller.uploadFile(mockFile, mockRequest);

      expect(result).toEqual(expectedResult);
      expect(uploadService.handleFileUpload).toHaveBeenCalledWith(
        'http://[::1]:3000',
        mockFile,
      );
    });

    it('should handle localhost without port', () => {
      const mockRequest = createMockRequest('http', 'localhost') as Request;
      const expectedResult = {
        message: 'File uploaded successfully',
        filePath: 'http://localhost/public/uploads/test.jpg',
      };

      mockUploadService.handleFileUpload.mockReturnValue(expectedResult);

      const result = controller.uploadFile(mockFile, mockRequest);

      expect(result).toEqual(expectedResult);
      expect(uploadService.handleFileUpload).toHaveBeenCalledWith(
        'http://localhost',
        mockFile,
      );
    });

    it('should handle file with special characters in filename', () => {
      const mockRequest = createMockRequest() as Request;
      const specialFile: Express.Multer.File = {
        ...mockFile,
        originalname: 'test image (1).jpg',
        filename: '1234567890-test_image_1.jpg',
      };

      const expectedResult = {
        message: 'File uploaded successfully',
        filePath:
          'http://localhost:3000/public/uploads/1234567890-test_image_1.jpg',
      };

      mockUploadService.handleFileUpload.mockReturnValue(expectedResult);

      const result = controller.uploadFile(specialFile, mockRequest);

      expect(result).toEqual(expectedResult);
      expect(uploadService.handleFileUpload).toHaveBeenCalledWith(
        'http://localhost:3000',
        specialFile,
      );
    });

    it('should handle concurrent uploads', () => {
      const mockRequest1 = createMockRequest() as Request;
      const mockRequest2 = createMockRequest('https', 'example.com') as Request;

      const file1 = { ...mockFile, filename: 'file1.jpg' };
      const file2 = { ...mockFile, filename: 'file2.jpg' };

      const result1 = {
        message: 'success',
        filePath: 'http://localhost:3000/file1.jpg',
      };
      const result2 = {
        message: 'success',
        filePath: 'https://example.com/file2.jpg',
      };

      mockUploadService.handleFileUpload
        .mockReturnValueOnce(result1)
        .mockReturnValueOnce(result2);

      const upload1 = controller.uploadFile(file1, mockRequest1);
      const upload2 = controller.uploadFile(file2, mockRequest2);

      expect(upload1).toEqual(result1);
      expect(upload2).toEqual(result2);
      expect(uploadService.handleFileUpload).toHaveBeenCalledTimes(2);
      expect(uploadService.handleFileUpload).toHaveBeenNthCalledWith(
        1,
        'http://localhost:3000',
        file1,
      );
      expect(uploadService.handleFileUpload).toHaveBeenNthCalledWith(
        2,
        'https://example.com',
        file2,
      );
    });

    it('should handle empty file object', () => {
      const mockRequest = createMockRequest() as Request;
      const emptyFile = {} as Express.Multer.File;

      const expectedResult = {
        message: 'File uploaded successfully',
        filePath: 'http://localhost:3000/undefined',
      };

      mockUploadService.handleFileUpload.mockReturnValue(expectedResult);

      const result = controller.uploadFile(emptyFile, mockRequest);

      expect(result).toEqual(expectedResult);
      expect(uploadService.handleFileUpload).toHaveBeenCalledWith(
        'http://localhost:3000',
        emptyFile,
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(emptyFile);
    });
  });
});
