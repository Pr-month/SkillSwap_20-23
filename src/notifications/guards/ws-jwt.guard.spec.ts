import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { WsException } from '@nestjs/websockets';
import { JwtWsGuard } from './ws-jwt.guard';
import { JwtPayload } from '../../auth/auth.types';
import { Role } from '../../common/types';

describe('JwtWsGuard', () => {
  let guard: JwtWsGuard;

  const mockJwtPayload: JwtPayload = {
    sub: 'test-user-id',
    email: 'test@example.com',
    role: Role.USER,
  };

  const mockJwtConfig = {
    accessSecret: 'test-secret',
    refreshSecret: 'test-refresh-secret',
    accessExpiresIn: '15m',
    refreshExpiresIn: '7d',
  };

  const mockJwtService = {
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const createMockSocket = (token?: string | string[]): Socket => {
    return {
      handshake: {
        query: token !== undefined ? { token } : {},
      },
    } as unknown as Socket;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtWsGuard,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    guard = module.get<JwtWsGuard>(JwtWsGuard);

    // Reset all mocks
    jest.clearAllMocks();

    // Setup default mock returns
    mockConfigService.get.mockReturnValue(mockJwtConfig);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('verify', () => {
    it('should successfully verify a valid token and return SocketWithUser', () => {
      const token = 'valid-jwt-token';
      const mockSocket = createMockSocket(token);

      // Mock console.log to avoid output during tests
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      mockJwtService.verify.mockReturnValue(mockJwtPayload);

      const result = guard.verify(mockSocket);

      expect(mockConfigService.get).toHaveBeenCalledWith('JWT');
      expect(consoleSpy).toHaveBeenCalledWith(token);
      expect(mockJwtService.verify).toHaveBeenCalledWith(token, {
        secret: mockJwtConfig.accessSecret,
      });
      expect(result).toBe(mockSocket);
      expect(result.data).toEqual({
        user: mockJwtPayload,
      });

      consoleSpy.mockRestore();
    });

    it('should use default secret when JWT config is not available', () => {
      const token = 'valid-jwt-token';
      const mockSocket = createMockSocket(token);

      // Mock console.log to avoid output during tests
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      mockConfigService.get.mockReturnValue(null);
      mockJwtService.verify.mockReturnValue(mockJwtPayload);

      const result = guard.verify(mockSocket);

      expect(mockJwtService.verify).toHaveBeenCalledWith(token, {
        secret: 'superSecretValue',
      });
      expect(result).toBe(mockSocket);

      consoleSpy.mockRestore();
    });

    it('should use default secret when accessSecret is not in config', () => {
      const token = 'valid-jwt-token';
      const mockSocket = createMockSocket(token);

      // Mock console.log to avoid output during tests
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      mockConfigService.get.mockReturnValue({
        ...mockJwtConfig,
        accessSecret: undefined,
      });
      mockJwtService.verify.mockReturnValue(mockJwtPayload);

      const result = guard.verify(mockSocket);

      expect(mockJwtService.verify).toHaveBeenCalledWith(token, {
        secret: 'superSecretValue',
      });
      expect(result).toBe(mockSocket);

      consoleSpy.mockRestore();
    });

    it('should throw WsException when token is not provided', () => {
      const mockSocket = createMockSocket();

      // Mock console.log to avoid output during tests
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      expect(() => guard.verify(mockSocket)).toThrow(WsException);
      expect(() => guard.verify(mockSocket)).toThrow('Token is required');
      expect(mockJwtService.verify).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should throw WsException when token is undefined', () => {
      const mockSocket = createMockSocket(undefined);

      // Mock console.log to avoid output during tests
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      expect(() => guard.verify(mockSocket)).toThrow(WsException);
      expect(() => guard.verify(mockSocket)).toThrow('Token is required');

      consoleSpy.mockRestore();
    });

    it('should throw WsException when token is an empty string', () => {
      const mockSocket = createMockSocket('');

      // Mock console.log to avoid output during tests
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      expect(() => guard.verify(mockSocket)).toThrow(WsException);
      expect(() => guard.verify(mockSocket)).toThrow('Token is required');

      consoleSpy.mockRestore();
    });

    it('should throw WsException when token is an array', () => {
      const mockSocket = createMockSocket(['token1', 'token2']);

      // Mock console.log to avoid output during tests
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      expect(() => guard.verify(mockSocket)).toThrow(WsException);
      expect(() => guard.verify(mockSocket)).toThrow(
        'Token must not be an array!',
      );
      expect(mockJwtService.verify).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should throw WsException when token is a single-element array', () => {
      const mockSocket = createMockSocket(['single-token']);

      // Mock console.log to avoid output during tests
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      expect(() => guard.verify(mockSocket)).toThrow(WsException);
      expect(() => guard.verify(mockSocket)).toThrow(
        'Token must not be an array!',
      );

      consoleSpy.mockRestore();
    });

    it('should throw WsException when JWT verification fails', () => {
      const token = 'invalid-jwt-token';
      const mockSocket = createMockSocket(token);
      const verificationError = new Error('jwt expired');

      // Mock console.log to capture error logging
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      mockJwtService.verify.mockImplementation(() => {
        throw verificationError;
      });

      expect(() => guard.verify(mockSocket)).toThrow(WsException);
      expect(() => guard.verify(mockSocket)).toThrow('Invalid token');
      expect(consoleSpy).toHaveBeenCalledWith(verificationError);

      consoleSpy.mockRestore();
    });

    it('should handle different JWT verification errors', () => {
      const token = 'malformed-jwt-token';
      const mockSocket = createMockSocket(token);
      const errors = [
        new Error('jwt malformed'),
        new Error('invalid signature'),
        new Error('jwt expired'),
        new Error('invalid token'),
      ];

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      errors.forEach((error) => {
        // Clear all mocks before each iteration
        jest.clearAllMocks();
        mockConfigService.get.mockReturnValue(mockJwtConfig);
        consoleSpy.mockClear();

        mockJwtService.verify.mockImplementation(() => {
          throw error;
        });

        expect(() => guard.verify(mockSocket)).toThrow(WsException);
        expect(() => guard.verify(mockSocket)).toThrow('Invalid token');
        expect(consoleSpy).toHaveBeenCalledWith(token);
        expect(consoleSpy).toHaveBeenCalledWith(error);
      });

      consoleSpy.mockRestore();
    });

    it('should handle socket without handshake property', () => {
      const mockSocket = {} as Socket;

      // Mock console.log to avoid output during tests
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      expect(() => guard.verify(mockSocket)).toThrow(TypeError);
      expect(() => guard.verify(mockSocket)).toThrow(
        "Cannot read properties of undefined (reading 'query')",
      );

      consoleSpy.mockRestore();
    });

    it('should handle socket with null handshake.query', () => {
      const mockSocket = {
        handshake: {
          query: null,
        },
      } as unknown as Socket;

      // Mock console.log to avoid output during tests
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      expect(() => guard.verify(mockSocket)).toThrow(WsException);
      expect(() => guard.verify(mockSocket)).toThrow('Token is required');

      consoleSpy.mockRestore();
    });

    it('should preserve existing socket properties when adding user data', () => {
      const token = 'valid-jwt-token';
      const mockSocket = createMockSocket(token);
      (mockSocket as unknown as { id: string; rooms: Set<string> }).id =
        'socket-123';
      (mockSocket as unknown as { id: string; rooms: Set<string> }).rooms =
        new Set(['room1']);

      // Mock console.log to avoid output during tests
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      mockJwtService.verify.mockReturnValue(mockJwtPayload);

      const result = guard.verify(mockSocket);

      expect((result as unknown as { id: string; rooms: Set<string> }).id).toBe(
        'socket-123',
      );
      expect(
        (result as unknown as { id: string; rooms: Set<string> }).rooms,
      ).toEqual(new Set(['room1']));
      expect(result.data.user).toEqual(mockJwtPayload);

      consoleSpy.mockRestore();
    });

    it('should handle different user roles in JWT payload', () => {
      const token = 'admin-jwt-token';
      const mockSocket = createMockSocket(token);
      const adminPayload: JwtPayload = {
        ...mockJwtPayload,
        role: Role.ADMIN,
      };

      // Mock console.log to avoid output during tests
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      mockJwtService.verify.mockReturnValue(adminPayload);

      const result = guard.verify(mockSocket);

      expect(result.data.user).toEqual(adminPayload);
      expect(result.data.user.role).toBe(Role.ADMIN);

      consoleSpy.mockRestore();
    });

    it('should handle JWT payload with additional properties', () => {
      const token = 'extended-jwt-token';
      const mockSocket = createMockSocket(token);
      const extendedPayload = {
        ...mockJwtPayload,
        iat: 1234567890,
        exp: 1234567890,
        customClaim: 'custom-value',
      };

      // Mock console.log to avoid output during tests
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      mockJwtService.verify.mockReturnValue(extendedPayload);

      const result = guard.verify(mockSocket);

      expect(result.data.user).toEqual(extendedPayload);

      consoleSpy.mockRestore();
    });
  });

  describe('edge cases', () => {
    it('should handle when configService.get throws an error', () => {
      const token = 'valid-jwt-token';
      const mockSocket = createMockSocket(token);

      // Mock console.log to avoid output during tests
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      mockConfigService.get.mockImplementation(() => {
        throw new Error('Config error');
      });

      // Should throw the error from configService.get
      expect(() => guard.verify(mockSocket)).toThrow('Config error');
      expect(mockJwtService.verify).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should handle concurrent verify calls', () => {
      const tokens = ['token1', 'token2', 'token3'];
      const sockets = tokens.map((token) => createMockSocket(token));

      // Mock console.log to avoid output during tests
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      mockJwtService.verify.mockReturnValue(mockJwtPayload);

      const results = sockets.map((socket) => guard.verify(socket));

      results.forEach((result, index) => {
        expect(result).toBe(sockets[index]);
        expect(result.data.user).toEqual(mockJwtPayload);
      });
      expect(mockJwtService.verify).toHaveBeenCalledTimes(3);

      consoleSpy.mockRestore();
    });

    it('should handle special characters in token', () => {
      const specialToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';
      const mockSocket = createMockSocket(specialToken);

      // Mock console.log to avoid output during tests
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      mockJwtService.verify.mockReturnValue(mockJwtPayload);

      const result = guard.verify(mockSocket);

      expect(mockJwtService.verify).toHaveBeenCalledWith(specialToken, {
        secret: mockJwtConfig.accessSecret,
      });
      expect(result).toBe(mockSocket);

      consoleSpy.mockRestore();
    });

    it('should verify token before creating SocketWithUser', () => {
      const token = 'test-jwt-token';
      const mockSocket = createMockSocket(token);
      let verifyCallOrder = 0;
      let dataAssignmentOrder = 0;

      // Mock console.log to avoid output during tests
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      mockJwtService.verify.mockImplementation(() => {
        verifyCallOrder = 1;
        return mockJwtPayload;
      });

      const result = guard.verify(mockSocket);
      dataAssignmentOrder = result.data ? 2 : 0;

      expect(verifyCallOrder).toBeLessThan(dataAssignmentOrder);
      expect(verifyCallOrder).toBe(1);
      expect(dataAssignmentOrder).toBe(2);

      consoleSpy.mockRestore();
    });
  });
});
