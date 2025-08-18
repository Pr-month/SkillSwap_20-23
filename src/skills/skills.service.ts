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
import { UsersService } from '../users/users.service';
import { Repository } from 'typeorm';
import { CreateSkillDto } from './dto/create-skill.dto';
import { FindSkillsQueryDto } from './dto/find-skills.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { Skill } from './entities/skill.entity';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill) private skillRepository: Repository<Skill>,
    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService,
  ) { }

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
      db.where('LOWER(skill.title) LIKE :search', { search: `%${search}%` });
    }

    if (categorySearch) {
      db.where('LOWER(category.name) LIKE :search', {
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
      return other;
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

    console.log('test test');

    const currentUser = await this.userService.findUserById(userId);

    if (currentUser.id !== skill.owner.id)
      throw new ForbiddenException('Недостаточно прав');

    return this.skillRepository.save({
      ...skill,
      ...updateSkillDto,
    });
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
      return await this.skillRepository.remove(skill);
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

    return await this.userService.updateUserById(user.id, {
      ...user,
      favoriteSkills: user.favoriteSkills
        ? [...user.favoriteSkills, skill]
        : [skill],
      wantToLearn: []
    });
  }

  async removeFavorite(userId: string, skillId: string) {
    const user = await this.userService.findUserById(userId);

    if (
      !user.favoriteSkills ||
      !user.favoriteSkills.find((obj) => obj.id === skillId)
    )
      throw new BadRequestException('Выбранного навыка нет в списке избранных');

    return await this.userService.updateUserById(user.id, {
      ...user,
      favoriteSkills: user.favoriteSkills.filter((obj) => obj.id !== skillId),
      wantToLearn: []
    });
  }
}