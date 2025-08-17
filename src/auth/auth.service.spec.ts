/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Category } from 'src/categories/entities/category.entity';
import { Gender, Role } from '../common/types';
import { jwtConfig } from '../config/jwt.config';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { JwtPayload } from './auth.types';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;

  const mockJwtConfig = {
    accessSecret: 'test-access-secret',
    refreshSecret: 'test-refresh-secret',
    accessExpiration: '1h',
    refreshExpiration: '7d',
    hashSaltRounds: 10,
  };

  const mockUser: User = {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword',
    about: 'About me',
    birthDate: new Date('1990-01-01'),
    city: 'Test City',
    gender: Gender.MALE,
    avatar: 'avatar.jpg',
    role: Role.USER,
    refreshToken: 'hashedRefreshToken',
  };

  const mockUsersService = {
    updateUserById: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const mockCategoriesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Category),
          useValue: mockCategoriesService,
        },
        {
          provide: jwtConfig.KEY,
          useValue: mockJwtConfig,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      name: 'New User',
      email: 'newuser@example.com',
      password: 'password123',
      gender: Gender.MALE,
      avatar: 'avatar.jpg',
    };

    it('should successfully register a new user', async () => {
      const hashedPassword = 'hashedPassword123';
      const hashedRefreshToken = 'hashedRefreshToken';
      const accessToken = 'accessToken';
      const refreshToken = 'refreshToken';
      const createdUser: User = {
        ...mockUser,
        ...registerDto,
        password: hashedPassword,
      } as User;

      (bcrypt.hash as jest.Mock)
        .mockResolvedValueOnce(hashedPassword)
        .mockResolvedValueOnce(hashedRefreshToken);
      mockUserRepository.create.mockReturnValue(createdUser);
      mockUserRepository.save.mockResolvedValue({
        ...createdUser,
        refreshToken: hashedRefreshToken,
      });
      mockJwtService.signAsync
        .mockResolvedValueOnce(accessToken)
        .mockResolvedValueOnce(refreshToken);

      const result = await service.register(registerDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        ...registerDto,
        password: hashedPassword,
        wantToLearn: expect.any(Array),
      });
      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        user: expect.not.objectContaining({
          password: expect.any(String),
          refreshToken: expect.any(String),
        }),
        tokens: {
          accessToken,
          refreshToken,
        },
      });
    });

    it('should handle optional fields in registration', async () => {
      const registerDtoWithOptional: RegisterDto = {
        ...registerDto,
        birthDate: new Date('1995-05-05'),
        city: 'Test City',
        wantToLearn: [],
        skills: [],
      };
      const hashedPassword = 'hashedPassword123';
      const hashedRefreshToken = 'hashedRefreshToken';
      const createdUser: User = {
        ...mockUser,
        ...registerDtoWithOptional,
        password: hashedPassword,
      } as User;

      (bcrypt.hash as jest.Mock)
        .mockResolvedValueOnce(hashedPassword)
        .mockResolvedValueOnce(hashedRefreshToken);
      mockUserRepository.create.mockReturnValue(createdUser);
      mockUserRepository.save.mockResolvedValue({
        ...createdUser,
        refreshToken: hashedRefreshToken,
      });
      mockJwtService.signAsync
        .mockResolvedValueOnce('accessToken')
        .mockResolvedValueOnce('refreshToken');

      const result = await service.register(registerDtoWithOptional);

      expect(mockUserRepository.create).toHaveBeenCalledWith({
        ...registerDtoWithOptional,
        password: hashedPassword,
      });
      expect(result.user).toMatchObject({
        birthDate: registerDtoWithOptional.birthDate,
        city: registerDtoWithOptional.city,
      });
    });

    it('should handle database save error', async () => {
      const hashedPassword = 'hashedPassword123';

      (bcrypt.hash as jest.Mock).mockResolvedValueOnce(hashedPassword);
      mockUserRepository.create.mockReturnValue({
        ...mockUser,
        ...registerDto,
        password: hashedPassword,
      });
      mockJwtService.signAsync
        .mockResolvedValueOnce('accessToken')
        .mockResolvedValueOnce('refreshToken');
      mockUserRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.register(registerDto)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should successfully login a user', async () => {
      const hashedRefreshToken = 'hashedRefreshToken';
      const accessToken = 'accessToken';
      const refreshToken = 'refreshToken';

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedRefreshToken);
      mockJwtService.signAsync
        .mockResolvedValueOnce(accessToken)
        .mockResolvedValueOnce(refreshToken);
      mockUserRepository.update.mockResolvedValue(undefined);

      const result = await service.login(loginDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(mockUserRepository.update).toHaveBeenCalledWith(mockUser.id, {
        refreshToken: hashedRefreshToken,
      });
      expect(result).toEqual({
        user: expect.not.objectContaining({
          password: expect.any(String),
          refreshToken: expect.any(String),
        }),
        tokens: {
          accessToken,
          refreshToken,
        },
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid email credentials!',
      );

      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid password credentials!',
      );

      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('should handle database update error', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedRefreshToken');
      mockJwtService.signAsync
        .mockResolvedValueOnce('accessToken')
        .mockResolvedValueOnce('refreshToken');
      mockUserRepository.update.mockRejectedValue(new Error('Database error'));

      await expect(service.login(loginDto)).rejects.toThrow('Database error');
    });
  });

  describe('refresh', () => {
    const jwtPayload: JwtPayload = {
      sub: 'test-user-id',
      email: 'test@example.com',
      role: Role.USER,
    };

    it('should successfully refresh tokens', async () => {
      const newAccessToken = 'newAccessToken';
      const newRefreshToken = 'newRefreshToken';
      const hashedNewRefreshToken = 'hashedNewRefreshToken';

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockJwtService.signAsync
        .mockResolvedValueOnce(newAccessToken)
        .mockResolvedValueOnce(newRefreshToken);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedNewRefreshToken);
      mockUsersService.updateUserById.mockResolvedValue(undefined);

      const result = await service.refresh(jwtPayload);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: jwtPayload.sub },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        newRefreshToken,
        mockUser.refreshToken,
      );
      expect(mockUsersService.updateUserById).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          refreshToken: hashedNewRefreshToken,
        }),
      );
      expect(result).toEqual({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.refresh(jwtPayload)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.refresh(jwtPayload)).rejects.toThrow(
        'Access denied!',
      );

      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockJwtService.signAsync
        .mockResolvedValueOnce('newAccessToken')
        .mockResolvedValueOnce('newRefreshToken');
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.refresh(jwtPayload)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.refresh(jwtPayload)).rejects.toThrow(
        'Access denied!',
      );

      expect(mockUsersService.updateUserById).not.toHaveBeenCalled();
    });

    it('should handle user with admin role', async () => {
      const adminPayload: JwtPayload = {
        ...jwtPayload,
        role: Role.ADMIN,
      };
      const adminUser = { ...mockUser, role: Role.ADMIN };

      mockUserRepository.findOne.mockResolvedValue(adminUser);
      mockJwtService.signAsync
        .mockResolvedValueOnce('adminAccessToken')
        .mockResolvedValueOnce('adminRefreshToken');
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedAdminRefreshToken');
      mockUsersService.updateUserById.mockResolvedValue(undefined);

      const result = await service.refresh(adminPayload);

      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: adminUser.id,
          email: adminUser.email,
          role: Role.ADMIN,
        }),
        expect.any(Object),
      );
      expect(result).toBeDefined();
    });
  });

  describe('logout', () => {
    it('should successfully clear refresh token', async () => {
      const userId = 'test-user-id';
      mockUserRepository.update.mockResolvedValue(undefined);

      await service.logout(userId);

      expect(mockUserRepository.update).toHaveBeenCalledWith(userId, {
        refreshToken: '',
      });
    });

    it('should handle database error during logout', async () => {
      const userId = 'test-user-id';
      mockUserRepository.update.mockRejectedValue(new Error('Database error'));

      await expect(service.logout(userId)).rejects.toThrow('Database error');
    });
  });

  describe('_getTokens', () => {
    it('should generate access and refresh tokens', async () => {
      const accessToken = 'generatedAccessToken';
      const refreshToken = 'generatedRefreshToken';

      mockJwtService.signAsync
        .mockResolvedValueOnce(accessToken)
        .mockResolvedValueOnce(refreshToken);

      const result = await service._getTokens(mockUser);

      expect(mockJwtService.signAsync).toHaveBeenNthCalledWith(
        1,
        {
          sub: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
        },
        {
          secret: mockJwtConfig.accessSecret,
          expiresIn: mockJwtConfig.accessExpiration,
        },
      );
      expect(mockJwtService.signAsync).toHaveBeenNthCalledWith(
        2,
        {
          sub: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
        },
        {
          secret: mockJwtConfig.refreshSecret,
          expiresIn: mockJwtConfig.refreshExpiration,
        },
      );
      expect(result).toEqual({ accessToken, refreshToken });
    });

    it('should handle user without role', async () => {
      const userWithoutRole: Partial<User> = { ...mockUser, role: undefined };
      const accessToken = 'accessToken';
      const refreshToken = 'refreshToken';

      mockJwtService.signAsync
        .mockResolvedValueOnce(accessToken)
        .mockResolvedValueOnce(refreshToken);

      const result = await service._getTokens(userWithoutRole as User);

      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          role: Role.USER, // Should default to USER
        }),
        expect.any(Object),
      );
      expect(result).toEqual({ accessToken, refreshToken });
    });

    it('should handle JWT signing error', async () => {
      mockJwtService.signAsync.mockRejectedValue(new Error('JWT error'));

      await expect(service._getTokens(mockUser)).rejects.toThrow('JWT error');
    });
  });

  describe('excludePasswordAndRefreshToken', () => {
    it('should exclude sensitive data from user object', () => {
      const userWithSensitiveData = {
        id: 'test-id',
        name: 'Test User',
        email: 'test@example.com',
        password: 'plainPassword',
        refreshToken: 'plainRefreshToken',
        role: Role.USER,
        gender: Gender.MALE,
        avatar: 'avatar.jpg',
      };

      // Access the private method using bracket notation
      const result = service['excludePasswordAndRefreshToken'](
        userWithSensitiveData as User,
      );

      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('refreshToken');
      expect(result).toHaveProperty('id', 'test-id');
      expect(result).toHaveProperty('name', 'Test User');
      expect(result).toHaveProperty('email', 'test@example.com');
    });

    it('should handle user with null or undefined values', () => {
      const userWithNullValues = {
        ...mockUser,
        about: null,
        birthDate: null,
        city: null,
        skills: undefined,
        favoriteSkills: undefined,
      };

      const result = service['excludePasswordAndRefreshToken'](
        userWithNullValues as User,
      );

      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('refreshToken');
      expect(result.about).toBeNull();
      expect(result.birthDate).toBeNull();
      expect(result.city).toBeNull();
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle bcrypt hash errors during registration', async () => {
      const registerDto: RegisterDto = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
        gender: Gender.MALE,
        avatar: 'avatar.jpg',
      };

      (bcrypt.hash as jest.Mock).mockRejectedValue(new Error('Hash error'));

      await expect(service.register(registerDto)).rejects.toThrow('Hash error');
    });

    it('should handle JWT service configuration errors', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockRejectedValue(
        new Error('JWT configuration error'),
      );

      await expect(service.login(loginDto)).rejects.toThrow(
        'JWT configuration error',
      );
    });

    it('should handle concurrent token generation', async () => {
      // Mock implementation that returns different values based on the payload
      mockJwtService.signAsync.mockImplementation(
        (payload: JwtPayload, options: { secret: string }) => {
          if (options.secret === mockJwtConfig.accessSecret) {
            return Promise.resolve(`access-${payload.sub}`);
          } else {
            return Promise.resolve(`refresh-${payload.sub}`);
          }
        },
      );

      // Simulate concurrent token generation
      const [result1, result2] = await Promise.all([
        service._getTokens(mockUser),
        service._getTokens({ ...mockUser, id: 'user2' }),
      ]);

      expect(result1).toEqual({
        accessToken: 'access-test-user-id',
        refreshToken: 'refresh-test-user-id',
      });
      expect(result2).toEqual({
        accessToken: 'access-user2',
        refreshToken: 'refresh-user2',
      });

      // Verify that signAsync was called 4 times (2 tokens x 2 users)
      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(4);
    });
  });
});
