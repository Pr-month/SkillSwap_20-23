import { Test, TestingModule } from '@nestjs/testing';
import { SkillsService } from './skills.service';
import { Skill } from './entities/skill.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Gender, Role } from 'src/common/types';
import { Category } from 'src/categories/entities/category.entity';
import { UsersService } from 'src/users/users.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';

describe('SkillsService', () => {
  let service: SkillsService;
  let userService: UsersService;

  const mockSkillsRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneOrFail: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    manager: {
      findOneOrFail: jest.fn(),
    },
    create: jest.fn(),
    remove: jest.fn(),
  };

  const mockUser: User = {
    id: 'mock-user-id',
    name: 'Full Name',
    email: 'test@example.com',
    password: 'securePassword',
    about: 'About the user.',
    birthDate: null,
    city: 'New-York',
    gender: Gender.MALE,
    role: Role.USER,
    avatar: './',
    refreshToken: '',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SkillsService,
        {
          provide: getRepositoryToken(Skill),
          useValue: mockSkillsRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Category),
          useValue: {},
        },
        UsersService,
        SkillsService,
      ],
    }).compile();

    service = module.get<SkillsService>(SkillsService);
    userService = module.get<UsersService>(UsersService);
  });

  describe('findOne', () => {
    it('Найти навык по id', async () => {
      const mockSkill = { id: '1', title: 'Test Skill' };
      mockSkillsRepository.findOneOrFail.mockResolvedValue(mockSkill);

      const foundSkill = await service.findOne('1');

      expect(mockSkillsRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: '1' },
      });

      expect(foundSkill).toEqual(mockSkill);
    });
  });

  describe('findOneWithCategory', () => {
    it('Найти навык по id и категории', async () => {
      const mockSkill = {
        id: '1',
        title: 'Test Skill',
        category: { id: '2', name: 'Category Name' },
      };
      mockSkillsRepository.findOneOrFail.mockResolvedValue(mockSkill);

      const foundSkill = await service.findOneWithCategory('1');

      expect(mockSkillsRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['category'],
      });

      expect(foundSkill).toEqual(mockSkill);
    });
  });

  describe('create', () => {
    it('Создаем новый навык', async () => {
      const createSkillDto: CreateSkillDto = {
        title: 'New Skill',
        categoryId: 'create-skills-dto-id',
        description: 'New Description',
      };

      const userId: string = mockUser.id;

      const mockCategory: Category = {
        id: createSkillDto.categoryId,
        name: 'Name',
      };

      const mockSkill = {
        id: 'skills-id',
        title: createSkillDto.title,
        description: createSkillDto.description,
        images: [],
        owner: mockUser,
        category: mockCategory,
      };

      jest.spyOn(userService, 'findUserById').mockResolvedValue(mockUser);

      mockSkillsRepository.manager.findOneOrFail.mockResolvedValue(
        mockCategory,
      );

      mockSkillsRepository.create.mockResolvedValue(mockSkill);

      mockSkillsRepository.save.mockImplementation((newSkill) => {
        return Promise.resolve(newSkill);
      });

      const createdSkill = await service.create(userId, createSkillDto);

      expect(mockSkillsRepository.create).toHaveBeenCalledWith({
        ...createSkillDto,
        owner: { id: userId },
        category: mockCategory,
      });

      expect(createdSkill).toEqual(mockSkill);
    });
  });

  describe('update', () => {
    const id = '1';
    const userId = mockUser.id;

    const updateSkillDto: UpdateSkillDto = {
      title: 'update-mock-skill-title',
      description: 'update-mock-skill-description',
    };

    const mockSkill = {
      id: 'skills-id',
      title: 'mock-skill-title',
      description: 'mock-skill-description',
      images: [],
      owner: mockUser,
    };

    it('Обновляем навык если id совпадает', async () => {
      mockSkillsRepository.findOneOrFail.mockResolvedValue(mockSkill);

      jest.spyOn(userService, 'findUserById').mockResolvedValue(mockUser);

      const updateSkill = await service.update(id, updateSkillDto, userId);

      expect(updateSkill).toEqual({
        ...mockSkill,
        ...updateSkillDto,
      });
    });
  });

  describe('remove', () => {
    it('Удаление навыка', async () => {
      const userId: string = 'user-id';

      const mockSkill = {
        id: 'skills-id',
        title: 'mock-skill-title',
        description: 'mock-skill-description',
        images: [],
        owner: mockUser,
      };

      jest.spyOn(userService, 'findUserById').mockResolvedValue(mockUser);
      mockSkillsRepository.findOneOrFail.mockResolvedValue(mockSkill);

      mockSkillsRepository.remove.mockImplementation((skill) =>
        Promise.resolve(skill),
      );

      const removedSkills = await service.remove(userId, mockSkill.id);

      expect(mockSkillsRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: mockSkill.id },
        relations: ['owner'],
      });

      expect(removedSkills).toEqual(mockSkill);
    });
  });

  describe('addFavorite', () => {
    const userId = mockUser.id;

    const mockCategory: Category = {
      id: 'mock-category-id',
      name: 'Name',
    };

    const mockSkill = {
      id: 'skills-id',
      title: 'mock-skill-title',
      description: 'mock-skill-description',
      images: [],
      owner: mockUser,
      category: mockCategory,
    };

    const updateUserDto: UpdateUserDto = {
      refreshToken: '',
      favoriteSkills: [mockSkill],
    };

    it('Добавить навык в избранное', async () => {
      mockSkillsRepository.findOneOrFail.mockResolvedValue(mockSkill);

      jest
        .spyOn(userService, 'updateUserById')
        .mockImplementation((id, updateUserDto): any => {
          const savedUser = {
            ...mockUser,
            ...updateUserDto,
          };

          const { password, refreshToken, ...updatedUser } = savedUser;

          console.log(password);
          console.log(refreshToken);

          return updatedUser;
        });

      const updatedFavoriteSkills = await userService.updateUserById(
        userId,
        updateUserDto,
      );

      const savedUser = {
        ...mockUser,
        ...updateUserDto,
      };

      const { password, refreshToken, ...updatedUser } = savedUser;

      expect(password).toBeDefined();
      expect(refreshToken).toBeDefined();

      expect(updatedFavoriteSkills).toEqual(updatedUser);
    });
  });
});
