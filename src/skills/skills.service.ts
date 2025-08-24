import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
//import * as fs from 'fs';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { FindSkillsQueryDto } from './dto/find-skills.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { Skill } from './entities/skill.entity';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill) private skillRepository: Repository<Skill>,
    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService,
    @Inject(forwardRef(() => CategoriesService))
    private readonly categoriesService: CategoriesService,
  ) {}

  async findOne(skillId: string): Promise<Skill> {
    return await this.skillRepository.findOneOrFail({ where: { id: skillId } });
  }

  async findOneWithCategory(skillId: string): Promise<Skill> {
    return await this.skillRepository.findOneOrFail({
      where: { id: skillId },
      relations: ['category'],
    });
  }

  async findAll(@Query() query: FindSkillsQueryDto) {
    const page = Math.max(parseInt(query.page ?? '1'), 1);
    const limit = Math.min(Math.max(parseInt(query.limit ?? '20'), 1), 100);
    const search = query.search?.trim() || '';
    const categorySearch = query.category?.trim().toLowerCase() || '';

    const db = this.skillRepository
      .createQueryBuilder('skill')
      .leftJoinAndSelect('skill.category', 'category');

    if (search) {
      console.log(search)
      db.where('LOWER(skill.title) LIKE :search', { search: `%${search}%` });
    }

    if (categorySearch) {
      console.log(categorySearch)
      db.where('LOWER(category.name) LIKE :categorySearch', {
        categorySearch: `%${categorySearch}%`,
      });
    }

    const [skills, total] = await db
      .skip((page - 1) * limit)
      .take(limit)
      .leftJoinAndSelect('skill.owner', 'owner')
      .getManyAndCount();

    const totalPage = Math.ceil(total / limit);
    if (page > totalPage && totalPage !== 0) {
      throw new NotFoundException({
        statusCode: 404,
        message: `Page ${page} exceeds total pages (${totalPage})`,
        error: 'Not Found',
      });
    }

    const formatSkills = skills.map((skill) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, refreshToken, ...other } = skill.owner;
      const formattedSkill = { ...skill, owner: other };
      return formattedSkill;
    });

    return { data: formatSkills, page, totalPage };
  }

  async create(userId: string, createSkillDto: CreateSkillDto): Promise<Skill> {
    try {
      const user = await this.userService.findUserById(userId);

      const category = await this.skillRepository.manager.findOneOrFail(
        'Category',
        {
          where: { id: createSkillDto.categoryId },
        },
      );

      const newSkill = this.skillRepository.create({
        ...createSkillDto,
        owner: { id: user.id },
        category,
      });

      return await this.skillRepository.save(newSkill);
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to update user',
        String(error),
      );
    }
  }

  async update(id: string, updateSkillDto: UpdateSkillDto, userId: string) {
    const skill = await this.skillRepository.findOneOrFail({
      where: {
        id,
      },
    });

    let updatedSkill: Skill;

    const currentUser = await this.userService.findUserById(userId);

    if (currentUser.id !== skill.owner.id)
      throw new ForbiddenException('Недостаточно прав');

    if (updateSkillDto.categoryId) {
      const newCategoryEntity = await this.categoriesService.getCategoryById(
        updateSkillDto.categoryId,
      );
      updatedSkill = {
        ...skill,
        ...updateSkillDto,
        category: newCategoryEntity,
      };
    } else {
      updatedSkill = {
        ...skill,
        ...updateSkillDto,
      };
    }

    return this.skillRepository.save(updatedSkill);
  }

  // deleteImages(imagesArray: string[]) {
  //   if (imagesArray.length == 0) {
  //     return console.log('Нечего удалять!');
  //   }
  //   for (const image of imagesArray) {
  //     fs.unlink(image, (err) => {
  //       if (err) console.log('Не удалось удалить картинку');
  //       else console.log(`Картинка удалена: ${image}`);
  //     });
  //   }
  // }

  async remove(userId: string, skillId: string) {
    const user = await this.userService.findUserById(userId);
    const skill = await this.skillRepository.findOneOrFail({
      where: { id: skillId },
      relations: ['owner'], // Загружаем связь owner
    });
    if (!skill.owner) throw new BadRequestException('Skill has no owner');
    if (user.id === skill.owner.id) {
      // this.deleteImages(skill.images);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, refreshToken, ...clearOwnerData } = skill.owner;

      return await this.skillRepository.remove(skill, {
        data: {
          ...skill,
          owner: clearOwnerData,
        },
      });
    } else {
      throw new ForbiddenException(
        'You do not have permission to delete this skill',
      );
    }
  }

  async addFavorite(userId: string, skillId: string) {
    const skill = await this.skillRepository.findOneOrFail({
      where: { id: skillId },
      relations: ['owner'],
    });

    const user = await this.userService.findUserById(userId);

    if (user.favoriteSkills?.find((obj) => obj.id === skill.id))
      throw new BadRequestException('Навык уже выбран избранным');

    await this.userService.updateUserById(user.id, {
      ...user,
      favoriteSkills: user.favoriteSkills
        ? [...user.favoriteSkills, skill]
        : [skill],
      wantToLearn: [],
    });

    return {
      message: 'Навык успешно добавлен в избранное',
    };
  }

  async removeFavorite(userId: string, skillId: string) {
    const user = await this.userService.findUserById(userId);

    if (
      !user.favoriteSkills ||
      !user.favoriteSkills.find((obj) => obj.id === skillId)
    )
      throw new BadRequestException('Выбранного навыка нет в списке избранных');

    await this.userService.updateUserById(user.id, {
      ...user,
      favoriteSkills: user.favoriteSkills.filter((obj) => obj.id !== skillId),
      wantToLearn: [],
    });

    return {
      message: 'Навык успешно удален из избранного',
    };
  }
}
