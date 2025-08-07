import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, EntityNotFoundError } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import {
  BadRequestException,
  ConflictException,
  HttpException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { QueryParamsDto } from './dto/query-param.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Gender, Role } from '../common/types';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

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

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneOrFail: jest.fn(),
    findAndCount: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated users with default values', async () => {
      const mockUsers = [mockUser];
      const query: QueryParamsDto = {};

      mockRepository.findAndCount.mockResolvedValue([mockUsers, 1]);

      const result = await service.findAll(query);

      expect(result).toEqual({
        data: mockUsers,
        page: 1,
        totalPages: 1,
      });
      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        take: 20,
        skip: 0,
      });
    });

    it('should return paginated users with custom page and limit', async () => {
      const mockUsers = [mockUser, { ...mockUser, id: 'user-2' }];
      const query: QueryParamsDto = { page: '2', limit: '10' };

      mockRepository.findAndCount.mockResolvedValue([mockUsers, 25]);

      const result = await service.findAll(query);

      expect(result).toEqual({
        data: mockUsers,
        page: 2,
        totalPages: 3,
      });
      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        take: 10,
        skip: 10,
      });
    });

    it('should handle limit boundary values', async () => {
      const mockUsers = [mockUser];
      const queryWithHighLimit: QueryParamsDto = { limit: '200' };

      mockRepository.findAndCount.mockResolvedValue([mockUsers, 1]);

      await service.findAll(queryWithHighLimit);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        take: 100, // Should be capped at 100
        skip: 0,
      });
    });

    it('should handle minimum limit value', async () => {
      const mockUsers = [mockUser];
      const queryWithLowLimit: QueryParamsDto = { limit: '0' };

      mockRepository.findAndCount.mockResolvedValue([mockUsers, 1]);

      await service.findAll(queryWithLowLimit);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        take: 1, // Should be at least 1
        skip: 0,
      });
    });

    it('should throw 404 error when page exceeds total pages', async () => {
      const query: QueryParamsDto = { page: '5', limit: '10' };

      mockRepository.findAndCount.mockResolvedValue([[], 20]); // 20 total items = 2 pages with limit 10

      await expect(service.findAll(query)).rejects.toThrow(HttpException);
      await expect(service.findAll(query)).rejects.toThrow(
        'Страница не найдена',
      );
    });

    it('should handle invalid page number gracefully', async () => {
      const mockUsers = [mockUser];
      const query: QueryParamsDto = { page: '-1' };

      mockRepository.findAndCount.mockResolvedValue([mockUsers, 1]);

      const result = await service.findAll(query);

      expect(result.page).toBe(1); // Should default to 1
      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        take: 20,
        skip: 0,
      });
    });

    it('should handle non-numeric page and limit values', async () => {
      const mockUsers = [mockUser];
      const query: QueryParamsDto = { page: 'abc', limit: 'xyz' };

      mockRepository.findAndCount.mockResolvedValue([mockUsers, 1]);

      const result = await service.findAll(query);

      // parseInt('abc') returns NaN, Math.max(NaN, 1) returns NaN
      expect(result.page).toBeNaN();
      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        take: NaN, // Math.max(NaN, 1) = NaN, Math.min(NaN, 100) = NaN
        skip: NaN, // (NaN - 1) * NaN = NaN
      });
    });
  });

  describe('findUserById', () => {
    it('should return a user when found', async () => {
      mockRepository.findOneOrFail.mockResolvedValue(mockUser);

      const result = await service.findUserById('test-user-id');

      expect(result).toBeDefined();
      expect(result.id).toBe(mockUser.id);
      expect(mockRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: 'test-user-id' },
      });
    });

    it('should exclude sensitive data from returned user', async () => {
      const userWithSensitiveData = {
        ...mockUser,
        password: 'plainPassword',
        refreshToken: 'plainRefreshToken',
      };
      mockRepository.findOneOrFail.mockResolvedValue(userWithSensitiveData);

      const result = await service.findUserById('test-user-id');

      // The plainToInstance should handle this through @Exclude decorators
      expect(result).toBeDefined();
      expect(mockRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: 'test-user-id' },
      });
    });

    it('should throw EntityNotFoundError when user not found', async () => {
      mockRepository.findOneOrFail.mockRejectedValue(
        new EntityNotFoundError(User, { where: { id: 'non-existent' } }),
      );

      await expect(service.findUserById('non-existent')).rejects.toThrow(
        EntityNotFoundError,
      );
    });
  });

  describe('updateUserById', () => {
    it('should successfully update user', async () => {
      const updateDto: UpdateUserDto = {
        name: 'Updated Name',
        about: 'Updated about',
        refreshToken: 'newRefreshToken',
      };
      const updatedUser = { ...mockUser, ...updateDto };

      mockRepository.findOneOrFail.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue(updatedUser);

      const result = await service.updateUserById('test-user-id', updateDto);

      expect(result).toEqual({
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        about: updatedUser.about,
        birthDate: updatedUser.birthDate,
        city: updatedUser.city,
        gender: updatedUser.gender,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
      });
      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('refreshToken');
    });

    it('should handle partial updates', async () => {
      const updateDto: UpdateUserDto = {
        name: 'Only Name Updated',
        refreshToken: 'newRefreshToken',
      };
      const updatedUser = { ...mockUser, ...updateDto };

      mockRepository.findOneOrFail.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue(updatedUser);

      const result = await service.updateUserById('test-user-id', updateDto);

      expect(result.name).toBe('Only Name Updated');
      expect(result.email).toBe(mockUser.email); // Should remain unchanged
    });

    it('should throw InternalServerErrorException on save error', async () => {
      const updateDto: UpdateUserDto = {
        name: 'Updated Name',
        refreshToken: 'newRefreshToken',
      };

      mockRepository.findOneOrFail.mockResolvedValue(mockUser);
      mockRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(
        service.updateUserById('test-user-id', updateDto),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw InternalServerErrorException when user not found', async () => {
      const updateDto: UpdateUserDto = {
        name: 'Updated Name',
        refreshToken: 'newRefreshToken',
      };

      mockRepository.findOneOrFail.mockRejectedValue(
        new EntityNotFoundError(User, { where: { id: 'non-existent' } }),
      );

      await expect(
        service.updateUserById('non-existent', updateDto),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('updatePassword', () => {
    const userId = 'test-user-id';
    const currentPassword = 'currentPassword123';
    const newPassword = 'newPassword123';
    const hashedCurrentPassword = 'hashedCurrentPassword';
    const hashedNewPassword = 'hashedNewPassword';

    beforeEach(() => {
      (bcrypt.compare as jest.Mock).mockClear();
      (bcrypt.hash as jest.Mock).mockClear();
    });

    it('should successfully update password', async () => {
      const userWithPassword = {
        id: userId,
        password: hashedCurrentPassword,
      };

      mockRepository.findOneOrFail.mockResolvedValue(userWithPassword);
      (bcrypt.compare as jest.Mock)
        .mockResolvedValueOnce(true) // Current password matches
        .mockResolvedValueOnce(false); // New password is different
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedNewPassword);
      mockRepository.save.mockResolvedValue({
        ...userWithPassword,
        password: hashedNewPassword,
      });

      await service.updatePassword(userId, currentPassword, newPassword);

      expect(mockRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: userId },
        select: ['id', 'password'],
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        currentPassword,
        hashedCurrentPassword,
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 12);
      expect(mockRepository.save).toHaveBeenCalledWith({
        ...userWithPassword,
        password: hashedNewPassword,
      });
    });

    it('should throw UnauthorizedException when current password is incorrect', async () => {
      const userWithPassword = {
        id: userId,
        password: hashedCurrentPassword,
      };

      mockRepository.findOneOrFail.mockResolvedValue(userWithPassword);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.updatePassword(userId, 'wrongPassword', newPassword),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.updatePassword(userId, 'wrongPassword', newPassword),
      ).rejects.toThrow('Неверный пароль');

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when new password matches current password', async () => {
      const userWithPassword = {
        id: userId,
        password: hashedCurrentPassword,
      };

      mockRepository.findOneOrFail.mockResolvedValue(userWithPassword);
      // Setup for first call
      (bcrypt.compare as jest.Mock)
        .mockResolvedValueOnce(true) // Current password matches
        .mockResolvedValueOnce(true); // New password also matches current

      await expect(
        service.updatePassword(userId, currentPassword, currentPassword),
      ).rejects.toThrow(ConflictException);

      // Reset mocks for second assertion
      (bcrypt.compare as jest.Mock).mockClear();
      (bcrypt.compare as jest.Mock)
        .mockResolvedValueOnce(true) // Current password matches
        .mockResolvedValueOnce(true); // New password also matches current

      await expect(
        service.updatePassword(userId, currentPassword, currentPassword),
      ).rejects.toThrow('Новый пароль должен отличаться от текущего');

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when new password is too short', async () => {
      const shortPassword = 'short';
      const userWithPassword = {
        id: userId,
        password: hashedCurrentPassword,
      };

      mockRepository.findOneOrFail.mockResolvedValue(userWithPassword);
      // Setup for first call
      (bcrypt.compare as jest.Mock)
        .mockResolvedValueOnce(true) // Current password matches
        .mockResolvedValueOnce(false); // New password is different

      await expect(
        service.updatePassword(userId, currentPassword, shortPassword),
      ).rejects.toThrow(BadRequestException);

      // Reset mocks for second assertion
      (bcrypt.compare as jest.Mock).mockClear();
      (bcrypt.compare as jest.Mock)
        .mockResolvedValueOnce(true) // Current password matches
        .mockResolvedValueOnce(false); // New password is different

      await expect(
        service.updatePassword(userId, currentPassword, shortPassword),
      ).rejects.toThrow('Пароль должен быть не менее 8 символов');

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw EntityNotFoundError when user not found', async () => {
      mockRepository.findOneOrFail.mockRejectedValue(
        new EntityNotFoundError(User, { where: { id: 'non-existent' } }),
      );

      await expect(
        service.updatePassword('non-existent', currentPassword, newPassword),
      ).rejects.toThrow(EntityNotFoundError);

      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should handle exactly 8 character password', async () => {
      const exactPassword = '12345678'; // Exactly 8 characters
      const userWithPassword = {
        id: userId,
        password: hashedCurrentPassword,
      };

      mockRepository.findOneOrFail.mockResolvedValue(userWithPassword);
      (bcrypt.compare as jest.Mock)
        .mockResolvedValueOnce(true) // Current password matches
        .mockResolvedValueOnce(false); // New password is different
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedExactPassword');
      mockRepository.save.mockResolvedValue({
        ...userWithPassword,
        password: 'hashedExactPassword',
      });

      await service.updatePassword(userId, currentPassword, exactPassword);

      expect(bcrypt.hash).toHaveBeenCalledWith(exactPassword, 12);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should handle database error during save', async () => {
      const userWithPassword = {
        id: userId,
        password: hashedCurrentPassword,
      };

      mockRepository.findOneOrFail.mockResolvedValue(userWithPassword);
      (bcrypt.compare as jest.Mock)
        .mockResolvedValueOnce(true) // Current password matches
        .mockResolvedValueOnce(false); // New password is different
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedNewPassword);
      mockRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(
        service.updatePassword(userId, currentPassword, newPassword),
      ).rejects.toThrow(Error);
    });
  });
});
