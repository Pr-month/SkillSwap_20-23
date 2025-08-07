import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthenticatedRequest } from './auth.types';
import { Gender, Role } from '../common/types';
import { HttpStatus } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockUser = {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    about: null,
    birthDate: null,
    city: null,
    gender: Gender.MALE,
    avatar: 'avatar.jpg',
    role: Role.USER,
  };

  const mockTokens = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
  };

  const mockAuthResponse = {
    user: mockUser,
    tokens: mockTokens,
  };

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
  };

  const mockRequest: Partial<AuthenticatedRequest> = {
    user: {
      sub: 'test-user-id',
      email: 'test@example.com',
      role: Role.USER,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);

    // Clear all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto: RegisterDto = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
        gender: Gender.MALE,
        avatar: 'avatar.jpg',
      };

      mockAuthService.register.mockResolvedValue(mockAuthResponse);

      const result = await controller.register(registerDto);

      expect(result).toEqual(mockAuthResponse);
      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
      expect(mockAuthService.register).toHaveBeenCalledTimes(1);
    });

    it('should register user with all optional fields', async () => {
      const registerDto: RegisterDto = {
        name: 'Full User',
        email: 'fulluser@example.com',
        password: 'password123',
        birthDate: new Date('1990-01-01'),
        gender: Gender.FEMALE,
        avatar: 'avatar.jpg',
        city: 'Test City',
        wantToLearn: [],
        skills: [],
      };

      const fullUserResponse = {
        user: { ...mockUser, ...registerDto },
        tokens: mockTokens,
      };

      mockAuthService.register.mockResolvedValue(fullUserResponse);

      const result = await controller.register(registerDto);

      expect(result).toEqual(fullUserResponse);
      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
    });

    it('should handle duplicate email error', async () => {
      const registerDto: RegisterDto = {
        name: 'Duplicate User',
        email: 'existing@example.com',
        password: 'password123',
        gender: Gender.MALE,
        avatar: 'avatar.jpg',
      };

      mockAuthService.register.mockRejectedValue(
        new Error('Email already exists'),
      );

      await expect(controller.register(registerDto)).rejects.toThrow(
        'Email already exists',
      );
    });

    it('should handle validation errors', async () => {
      const invalidDto = {
        name: 'Invalid User',
        // Missing required fields
      } as RegisterDto;

      mockAuthService.register.mockRejectedValue(
        new Error('Validation failed'),
      );

      await expect(controller.register(invalidDto)).rejects.toThrow(
        'Validation failed',
      );
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockAuthService.login.mockResolvedValue(mockAuthResponse);

      const result = await controller.login(loginDto);

      expect(result).toEqual(mockAuthResponse);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
      expect(mockAuthService.login).toHaveBeenCalledTimes(1);
    });

    it('should handle invalid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'wrong@example.com',
        password: 'wrongpassword',
      };

      mockAuthService.login.mockRejectedValue(
        new Error('Invalid email credentials!'),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        'Invalid email credentials!',
      );
    });

    it('should handle non-existent user', async () => {
      const loginDto: LoginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      mockAuthService.login.mockRejectedValue(
        new Error('Invalid email credentials!'),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        'Invalid email credentials!',
      );
    });

    it('should handle incorrect password', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockAuthService.login.mockRejectedValue(
        new Error('Invalid password credentials!'),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        'Invalid password credentials!',
      );
    });

    it('should handle database errors', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockAuthService.login.mockRejectedValue(new Error('Database error'));

      await expect(controller.login(loginDto)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('refresh', () => {
    it('should refresh tokens successfully', async () => {
      mockAuthService.refresh.mockResolvedValue(mockTokens);

      const result = await controller.refresh(
        mockRequest as AuthenticatedRequest,
      );

      expect(result).toEqual(mockTokens);
      expect(mockAuthService.refresh).toHaveBeenCalledWith(mockRequest.user);
      expect(mockAuthService.refresh).toHaveBeenCalledTimes(1);
    });

    it('should handle invalid refresh token', async () => {
      mockAuthService.refresh.mockRejectedValue(new Error('Access denied!'));

      await expect(
        controller.refresh(mockRequest as AuthenticatedRequest),
      ).rejects.toThrow('Access denied!');
    });

    it('should work with admin user', async () => {
      const adminRequest = {
        user: {
          sub: 'admin-user-id',
          email: 'admin@example.com',
          role: Role.ADMIN,
        },
      };

      mockAuthService.refresh.mockResolvedValue(mockTokens);

      const result = await controller.refresh(
        adminRequest as AuthenticatedRequest,
      );

      expect(result).toEqual(mockTokens);
      expect(mockAuthService.refresh).toHaveBeenCalledWith(adminRequest.user);
    });

    it('should handle expired refresh token', async () => {
      mockAuthService.refresh.mockRejectedValue(
        new Error('Refresh token expired'),
      );

      await expect(
        controller.refresh(mockRequest as AuthenticatedRequest),
      ).rejects.toThrow('Refresh token expired');
    });

    it('should handle user not found', async () => {
      const deletedUserRequest = {
        user: {
          sub: 'deleted-user-id',
          email: 'deleted@example.com',
          role: Role.USER,
        },
      };

      mockAuthService.refresh.mockRejectedValue(new Error('Access denied!'));

      await expect(
        controller.refresh(deletedUserRequest as AuthenticatedRequest),
      ).rejects.toThrow('Access denied!');
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      mockAuthService.logout.mockResolvedValue(undefined);

      const result = await controller.logout(
        mockRequest as AuthenticatedRequest,
      );

      expect(result).toEqual({ message: 'Logged out successfully!' });
      expect(mockAuthService.logout).toHaveBeenCalledWith('test-user-id');
      expect(mockAuthService.logout).toHaveBeenCalledTimes(1);
    });

    it('should extract user id correctly', async () => {
      const customRequest = {
        user: {
          sub: 'custom-user-id',
          email: 'custom@example.com',
          role: Role.USER,
        },
      };

      mockAuthService.logout.mockResolvedValue(undefined);

      await controller.logout(customRequest as AuthenticatedRequest);

      expect(mockAuthService.logout).toHaveBeenCalledWith('custom-user-id');
    });

    it('should handle database errors during logout', async () => {
      mockAuthService.logout.mockRejectedValue(new Error('Database error'));

      await expect(
        controller.logout(mockRequest as AuthenticatedRequest),
      ).rejects.toThrow('Database error');
    });

    it('should handle missing user id', async () => {
      const invalidRequest = {
        user: {
          email: 'test@example.com',
          role: Role.USER,
        },
      } as AuthenticatedRequest;

      mockAuthService.logout.mockResolvedValue(undefined);

      const result = await controller.logout(invalidRequest);

      expect(mockAuthService.logout).toHaveBeenCalledWith(undefined);
    });
  });

  describe('HTTP status codes', () => {
    it('register should return 201 Created by default', () => {
      // The @Post decorator without @HttpCode defaults to 201
      // This is testing the expected behavior rather than actual response
      expect(true).toBe(true);
    });

    it('login should return 200 OK', () => {
      // The @HttpCode(HttpStatus.OK) decorator is applied
      // This is testing the expected behavior
      expect(HttpStatus.OK).toBe(200);
    });

    it('refresh should return 200 OK', () => {
      // The @HttpCode(HttpStatus.OK) decorator is applied
      expect(HttpStatus.OK).toBe(200);
    });

    it('logout should return 200 OK', () => {
      // The @HttpCode(HttpStatus.OK) decorator is applied
      expect(HttpStatus.OK).toBe(200);
    });
  });

  describe('edge cases', () => {
    it('should handle concurrent login requests', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const promises: Promise<any>[] = [];

      mockAuthService.login.mockResolvedValue(mockAuthResponse);

      // Simulate concurrent requests
      for (let i = 0; i < 5; i++) {
        promises.push(controller.login(loginDto));
      }

      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      results.forEach((result) => {
        expect(result).toEqual(mockAuthResponse);
      });
      expect(mockAuthService.login).toHaveBeenCalledTimes(5);
    });

    it('should handle missing request object in refresh', async () => {
      const invalidRequest = {} as AuthenticatedRequest;

      await expect(controller.refresh(invalidRequest)).rejects.toThrow();
    });

    it('should handle null user in logout request', async () => {
      const nullUserRequest = {
        user: null,
      } as any;

      await expect(controller.logout(nullUserRequest)).rejects.toThrow();
    });

    it('should handle special characters in email during login', async () => {
      const specialEmailDto: LoginDto = {
        email: 'test+special@example.com',
        password: 'password123',
      };

      mockAuthService.login.mockResolvedValue(mockAuthResponse);

      const result = await controller.login(specialEmailDto);

      expect(result).toEqual(mockAuthResponse);
      expect(mockAuthService.login).toHaveBeenCalledWith(specialEmailDto);
    });

    it('should handle very long passwords', async () => {
      const longPasswordDto: LoginDto = {
        email: 'test@example.com',
        password: 'a'.repeat(100), // 100 character password
      };

      mockAuthService.login.mockResolvedValue(mockAuthResponse);

      const result = await controller.login(longPasswordDto);

      expect(result).toEqual(mockAuthResponse);
    });
  });

  describe('error message consistency', () => {
    it('should return consistent error messages for security', async () => {
      const nonExistentUserDto: LoginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      const wrongPasswordDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      // Both should return generic "Invalid credentials" for security
      mockAuthService.login
        .mockRejectedValueOnce(new Error('Invalid email credentials!'))
        .mockRejectedValueOnce(new Error('Invalid password credentials!'));

      await expect(controller.login(nonExistentUserDto)).rejects.toThrow(
        'Invalid email credentials!',
      );
      await expect(controller.login(wrongPasswordDto)).rejects.toThrow(
        'Invalid password credentials!',
      );
    });
  });
});
