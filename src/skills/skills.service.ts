import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { Skill } from './entities/skill.entity';
import { FindSkillsQueryDto } from './dto/find--skills.dto';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill) private skillRepository: Repository<Skill>,
    private readonly userService: UsersService,
  ) {}

  async findOne(skillId: string): Promise<Skill> {
    return await this.skillRepository.findOneOrFail({ where: { id: skillId } });
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
    return { data: skills, page, totalPage };
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

    const currentUser = await this.userService.findUserById(userId);

    if (currentUser.id !== skill.owner.id)
      throw new ForbiddenException('Недостаточно прав');

    return this.skillRepository.save({
      ...skill,
      ...updateSkillDto,
    });
  }

  async remove(userId: string, skillId: string) {
    try {
      const user = await this.userService.findUserById(userId);
      const skill = await this.skillRepository.findOneOrFail({
        where: { id: skillId },
        relations: ['owner'], // Загружаем связь owner
      });

      if (!skill.owner) throw new BadRequestException('Skill has no owner');

      if (user.id === skill.owner.id)
        return await this.skillRepository.remove(skill);
      else {
        throw new ForbiddenException(
          'You do not have permission to delete this skill',
        );
      }
    } catch (error) {
      if (
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new InternalServerErrorException(
        'Failed to delete skill',
        String(error),
      );
    }
  }
}
