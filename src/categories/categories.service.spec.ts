import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let categoryRepository: Repository<Category>;

  // Мок репозитория категорий
  const mockCategoryRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneOrFail: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    // Настройка тестового модуля
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: mockCategoryRepository,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    categoryRepository = module.get<Repository<Category>>(
      getRepositoryToken(Category),
    );
  });

  afterEach(() => {
    // Очистка моков после каждого теста
    jest.clearAllMocks();
    mockCategoryRepository.findOne.mockReset();
    mockCategoryRepository.save.mockReset();
  });

  describe('create', () => {
    it('должен успешно создавать корневую категорию', async () => {
      const createDto: CreateCategoryDto = { name: 'Test Category' };
      
      // Моделируем создание новой категории в сервисе
      const newCategory = new Category();
      newCategory.name = createDto.name;
      newCategory.parent = undefined;

      mockCategoryRepository.findOne.mockResolvedValue(null);
      mockCategoryRepository.save.mockImplementation((category) =>
        Promise.resolve({ ...category, id: '1' }),
      );

      const result = await service.create(createDto);

      expect(result).toEqual(
        expect.objectContaining({
          id: '1',
          name: 'Test Category',
          parent: undefined,
        }),
      );

      expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({
        where: { name: 'Test Category', parent: IsNull() },
      });

      expect(mockCategoryRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Category',
          parent: undefined,
        }),
      );
    });

    it('должен успешно создавать дочернюю категорию', async () => {
      const createDto: CreateCategoryDto = {
        name: 'Child Category',
        parentId: 'parent-1',
      };
      const parentCategory = { id: 'parent-1', name: 'Parent Category' };
      const savedCategory = {
        id: '2',
        name: 'Child Category',
        parent: parentCategory,
      };

      mockCategoryRepository.findOne
        .mockResolvedValueOnce(null) // Проверка уникальности имени
        .mockResolvedValueOnce(parentCategory); // Поиск родительской категории
      mockCategoryRepository.save.mockResolvedValue(savedCategory);

      const result = await service.create(createDto);

      expect(result).toEqual(savedCategory);
      expect(mockCategoryRepository.findOne).toHaveBeenCalledTimes(2);
      expect(mockCategoryRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Child Category',
          parent: parentCategory,
        }),
      );
    });

    it('должен выбрасывать ConflictException если новое имя не уникально', async () => {
      const createDto: CreateCategoryDto = { name: 'Existing Category' };
      const existingCategory = { id: '1', name: 'Existing Category' };

      mockCategoryRepository.findOne.mockResolvedValue(existingCategory);

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockCategoryRepository.save).not.toHaveBeenCalled();
    });

    it('должен выбрасывать NotFoundException если родительская категория не найдена', async () => {
      const createDto: CreateCategoryDto = {
        name: 'Child Category',
        parentId: 'non-existent-parent',
      };

      mockCategoryRepository.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('должен возвращать все корневые категории с детьми', async () => {
      const mockCategories = [
        {
          id: '1',
          name: 'Category 1',
          children: [{ id: '2', name: 'Child 1' }],
        },
      ];

      mockCategoryRepository.find.mockResolvedValue(mockCategories);

      const result = await service.findAll();

      expect(result).toEqual(mockCategories);
      expect(mockCategoryRepository.find).toHaveBeenCalledWith({
        where: { parent: IsNull() },
        relations: ['children'],
      });
    });

    it('должен возвращать пустой массив если категорий нет', async () => {
      mockCategoryRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('должен успешно обновлять категорию', async () => {
      const updateDto: UpdateCategoryDto = { name: 'Updated Name' };
      const existingCategory = { id: '1', name: 'Original Name' };
      const updatedCategory = { ...existingCategory, ...updateDto };

      mockCategoryRepository.findOneOrFail.mockResolvedValue(existingCategory);
      mockCategoryRepository.findOne.mockResolvedValue(null);
      mockCategoryRepository.save.mockResolvedValue(updatedCategory);

      const result = await service.update('1', updateDto);

      expect(result).toEqual(updatedCategory);
      expect(mockCategoryRepository.save).toHaveBeenCalledWith(
        expect.objectContaining(updateDto),
      );
    });

    it('должен выбрасывать BadRequestException при попытке сделать категорию родителем самой себя', async () => {
      const updateDto: UpdateCategoryDto = { parentId: '1' };
      const existingCategory = { id: '1', name: 'Test Category' };

      mockCategoryRepository.findOneOrFail.mockResolvedValue(existingCategory);

      await expect(service.update('1', updateDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('должен выбрасывать ConflictException если новое имя не уникально', async () => {
      const updateDto: UpdateCategoryDto = { name: 'Existing Name' };
      const existingCategory = { 
        id: '1', 
        name: 'Original Name',
        parent: null
      };
      const conflictingCategory = { 
        id: '2', 
        name: 'Existing Name',
        parent: null
      };

      mockCategoryRepository.findOneOrFail.mockResolvedValue(existingCategory);
      mockCategoryRepository.findOne.mockResolvedValue(conflictingCategory);
  
      // Не мокаем save, так как исключение должно быть выброшено до него
      mockCategoryRepository.save.mockImplementation(() => Promise.resolve());

      await expect(service.update('1', updateDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockCategoryRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('должен успешно удалять категорию без связанных навыков', async () => {
      const category = { id: '1', name: 'Test Category', skills: [] };

      mockCategoryRepository.findOne.mockResolvedValue(category);
      mockCategoryRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove('1');

      expect(mockCategoryRepository.delete).toHaveBeenCalledWith('1');
    });

    it('должен выбрасывать NotFoundException если категория не найдена', async () => {
      mockCategoryRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('должен выбрасывать ForbiddenException если у категории есть связанные навыки', async () => {
      const category = {
        id: '1',
        name: 'Test Category',
        skills: [{ id: 'skill-1', name: 'Test Skill' }],
      };

      mockCategoryRepository.findOne.mockResolvedValue(category);

      await expect(service.remove('1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('checkCategoryNameUnique', () => {
    it('не должен выбрасывать исключение если имя уникально в родительской категории', async () => {
      mockCategoryRepository.findOne.mockResolvedValue(null);

      await expect(
        service['checkCategoryNameUnique']('Unique Name', null),
      ).resolves.not.toThrow();
    });

    it('должен выбрасывать ConflictException если имя не уникально в родительской категории', async () => {
      const existingCategory = { id: '1', name: 'Existing Name' };
      mockCategoryRepository.findOne.mockResolvedValue(existingCategory);

      await expect(
        service['checkCategoryNameUnique']('Existing Name', null),
      ).rejects.toThrow(ConflictException);
    });

    it('не должен выбрасывать исключение если имя существует но исключено (сценарий обновления)', async () => {
      const existingCategory = { id: '1', name: 'Existing Name' };
      mockCategoryRepository.findOne.mockResolvedValue(existingCategory);

      await expect(
        service['checkCategoryNameUnique']('Existing Name', null, '1'),
      ).resolves.not.toThrow();
    });
  });
});
