import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { QueryParamsDto } from './dto/query-param.dto';
import { UpdateMeDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/password-update.dto';
import { AuthenticatedRequest } from '../auth/auth.types';
import { Gender, Role } from '../common/types';
import { CategoriesService } from 'src/categories/categories.service';
import { Category } from 'src/categories/entities/category.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUser = {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    about: 'About me',
    birthDate: new Date('1990-01-01'),
    city: 'Test City',
    gender: Gender.MALE,
    avatar: 'avatar.jpg',
    role: Role.USER,
  };

  const mockPaginatedResponse = {
    data: [mockUser],
    page: 1,
    totalPages: 1,
  };

  const mockUserService = {
    findAll: jest.fn(),
    findUserById: jest.fn(),
    updateUserById: jest.fn(),
    updatePassword: jest.fn(),
  };

  const mockRequest: Partial<AuthenticatedRequest> = {
    user: {
      sub: 'test-user-id',
      email: 'test@example.com',
      role: Role.USER,
    },
  };

  const mockCategoryRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneOrFail: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUserService,
        },
        {
          provide: getRepositoryToken(Category),
          useValue: mockCategoryRepository,
        },
        CategoriesService,
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);

    // Clear all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated users with default query params', async () => {
      const query: QueryParamsDto = {};
      mockUserService.findAll.mockResolvedValue(mockPaginatedResponse);

      const result = await controller.findAll(query);

      expect(result).toEqual(mockPaginatedResponse);
      expect(mockUserService.findAll).toHaveBeenCalledWith(query);
      expect(mockUserService.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return paginated users with custom query params', async () => {
      const query: QueryParamsDto = { page: '2', limit: '10' };
      const customResponse = {
        ...mockPaginatedResponse,
        page: 2,
        totalPages: 5,
      };
      mockUserService.findAll.mockResolvedValue(customResponse);

      const result = await controller.findAll(query);

      expect(result).toEqual(customResponse);
      expect(mockUserService.findAll).toHaveBeenCalledWith(query);
    });

    it('should handle service errors', async () => {
      const query: QueryParamsDto = {};
      mockUserService.findAll.mockRejectedValue(new Error('Database error'));

      await expect(controller.findAll(query)).rejects.toThrow('Database error');
    });
  });

  describe('getMe', () => {
    it('should return current user data', async () => {
      mockUserService.findUserById.mockResolvedValue(mockUser);

      const result = await controller.getMe(
        mockRequest as AuthenticatedRequest,
      );

      expect(result).toEqual(mockUser);
      expect(mockUserService.findUserById).toHaveBeenCalledWith('test-user-id');
      expect(mockUserService.findUserById).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors when getting current user', async () => {
      mockUserService.findUserById.mockRejectedValue(
        new Error('User not found'),
      );

      await expect(
        controller.getMe(mockRequest as AuthenticatedRequest),
      ).rejects.toThrow('User not found');
    });

    it('should work with admin role', async () => {
      const adminRequest = {
        user: {
          sub: 'admin-user-id',
          email: 'admin@example.com',
          role: Role.ADMIN,
        },
      };
      const adminUser = { ...mockUser, id: 'admin-user-id', role: Role.ADMIN };
      mockUserService.findUserById.mockResolvedValue(adminUser);

      const result = await controller.getMe(
        adminRequest as AuthenticatedRequest,
      );

      expect(result).toEqual(adminUser);
      expect(mockUserService.findUserById).toHaveBeenCalledWith(
        'admin-user-id',
      );
    });
  });

  describe('findOne', () => {
    it('should return user by id', async () => {
      const userId = 'test-user-id';
      mockUserService.findUserById.mockResolvedValue(mockUser);

      const result = await controller.findOne(userId);

      expect(result).toEqual(mockUser);
      expect(mockUserService.findUserById).toHaveBeenCalledWith(userId);
      expect(mockUserService.findUserById).toHaveBeenCalledTimes(1);
    });

    it('should handle non-existent user', async () => {
      const userId = 'non-existent-id';
      mockUserService.findUserById.mockRejectedValue(
        new Error('User not found'),
      );

      await expect(controller.findOne(userId)).rejects.toThrow(
        'User not found',
      );
    });

    it('should handle invalid user id format', async () => {
      const invalidId = 'invalid-uuid';
      mockUserService.findUserById.mockRejectedValue(new Error('Invalid UUID'));

      await expect(controller.findOne(invalidId)).rejects.toThrow(
        'Invalid UUID',
      );
    });
  });

  describe('updateMe', () => {
    it('should update current user successfully', async () => {
      const updateDto: UpdateMeDto = {
        name: 'Updated Name',
        about: 'Updated about',
        refreshToken: 'newRefreshToken',
        wantToLearn: [],
      };
      const updatedUser = { ...mockUser, ...updateDto };
      mockUserService.updateUserById.mockResolvedValue(updatedUser);

      const result = await controller.updateMe(
        mockRequest as AuthenticatedRequest,
        updateDto,
      );

      expect(result).toEqual(updatedUser);
      expect(mockUserService.updateUserById).toHaveBeenCalledWith(
        'test-user-id',
        updateDto,
      );
      expect(mockUserService.updateUserById).toHaveBeenCalledTimes(1);
    });

    it('should handle partial updates', async () => {
      const updateDto = {
        name: 'Only Name Updated',
        refreshToken: 'newRefreshToken',
        wantToLearn: [],
      };
      const updatedUser = { ...mockUser, name: 'Only Name Updated' };
      mockUserService.updateUserById.mockResolvedValue(updatedUser);

      const result = await controller.updateMe(
        mockRequest as AuthenticatedRequest,
        updateDto,
      );

      expect(result).toEqual(updatedUser);
      expect(mockUserService.updateUserById).toHaveBeenCalledWith(
        'test-user-id',
        updateDto,
      );
    });

    it('should handle update with all optional fields', async () => {
      const updateDto = {
        name: 'Full Update',
        email: 'newemail@example.com',
        about: 'New about',
        birthDate: new Date('1995-05-05'),
        city: 'New City',
        gender: Gender.FEMALE,
        avatar: 'new-avatar.jpg',
        refreshToken: 'newRefreshToken',
      };
      const updatedUser = { ...mockUser, ...updateDto };
      mockUserService.updateUserById.mockResolvedValue(updatedUser);

      const result = await controller.updateMe(
        mockRequest as AuthenticatedRequest,
        updateDto,
      );

      expect(result).toEqual(updatedUser);
    });

    it('should handle service errors during update', async () => {
      const updateDto = {
        name: 'Updated Name',
        refreshToken: 'newRefreshToken',
      };
      mockUserService.updateUserById.mockRejectedValue(
        new Error('Update failed'),
      );

      await expect(
        controller.updateMe(mockRequest as AuthenticatedRequest, updateDto),
      ).rejects.toThrow('Update failed');
    });
  });

  describe('updatePassword', () => {
    it('should update password successfully and return no content', async () => {
      const updatePasswordDto = {
        currentPassword: 'oldPassword123',
        newPassword: 'newPassword123',
      };
      mockUserService.updatePassword.mockResolvedValue(undefined);

      await controller.updatePassword(
        mockRequest as AuthenticatedRequest,
        updatePasswordDto,
      );

      expect(mockUserService.updatePassword).toHaveBeenCalledWith(
        'test-user-id',
        'oldPassword123',
        'newPassword123',
      );
      expect(mockUserService.updatePassword).toHaveBeenCalledTimes(1);
    });

    it('should handle incorrect current password', async () => {
      const updatePasswordDto: UpdatePasswordDto = {
        currentPassword: 'wrongPassword',
        newPassword: 'newPassword123',
      };
      mockUserService.updatePassword.mockRejectedValue(
        new Error('Неверный пароль'),
      );

      await expect(
        controller.updatePassword(
          mockRequest as AuthenticatedRequest,
          updatePasswordDto,
        ),
      ).rejects.toThrow('Неверный пароль');
    });

    it('should handle password validation errors', async () => {
      const updatePasswordDto: UpdatePasswordDto = {
        currentPassword: 'oldPassword123',
        newPassword: 'short',
      };
      mockUserService.updatePassword.mockRejectedValue(
        new Error('Пароль должен быть не менее 8 символов'),
      );

      await expect(
        controller.updatePassword(
          mockRequest as AuthenticatedRequest,
          updatePasswordDto,
        ),
      ).rejects.toThrow('Пароль должен быть не менее 8 символов');
    });

    it('should handle same password error', async () => {
      const updatePasswordDto: UpdatePasswordDto = {
        currentPassword: 'samePassword123',
        newPassword: 'samePassword123',
      };
      mockUserService.updatePassword.mockRejectedValue(
        new Error('Новый пароль должен отличаться от текущего'),
      );

      await expect(
        controller.updatePassword(
          mockRequest as AuthenticatedRequest,
          updatePasswordDto,
        ),
      ).rejects.toThrow('Новый пароль должен отличаться от текущего');
    });

    it('should extract user id from request correctly', async () => {
      const updatePasswordDto: UpdatePasswordDto = {
        currentPassword: 'oldPassword123',
        newPassword: 'newPassword123',
      };
      const customRequest = {
        user: {
          sub: 'custom-user-id',
          email: 'custom@example.com',
          role: Role.USER,
        },
      };
      mockUserService.updatePassword.mockResolvedValue(undefined);

      await controller.updatePassword(
        customRequest as AuthenticatedRequest,
        updatePasswordDto,
      );

      expect(mockUserService.updatePassword).toHaveBeenCalledWith(
        'custom-user-id',
        'oldPassword123',
        'newPassword123',
      );
    });
  });

  describe('edge cases', () => {
    it('should handle missing user in request for getMe', () => {
      const invalidRequest = {} as AuthenticatedRequest;

      expect(() => controller.getMe(invalidRequest)).toThrow(
        "Cannot read properties of undefined (reading 'sub')",
      );
    });

    it('should handle missing user.sub in request for updateMe', async () => {
      const invalidRequest = { user: {} } as AuthenticatedRequest;
      const updateDto = {
        name: 'Test',
        refreshToken: 'token',
      };

      await expect(
        controller.updateMe(invalidRequest, updateDto),
      ).rejects.toThrow();
    });

    it('should handle concurrent requests', async () => {
      const promises: Promise<any>[] = [];
      mockUserService.findAll.mockResolvedValue(mockPaginatedResponse);

      // Simulate concurrent requests
      for (let i = 0; i < 5; i++) {
        promises.push(controller.findAll({}));
      }

      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      results.forEach((result) => {
        expect(result).toEqual(mockPaginatedResponse);
      });
      expect(mockUserService.findAll).toHaveBeenCalledTimes(5);
    });
  });
});
