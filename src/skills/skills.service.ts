import { Injectable, NotFoundException, Query } from '@nestjs/common';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Skill } from './entities/skill.entity';
import { FindSkillsQueryDto } from './dto/find--skills.dto';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill) private skillRepository: Repository<Skill>,
  ) {}

  create(createSkillDto: CreateSkillDto) {
    console.log(createSkillDto);
    return 'This action adds a new skill';
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

  findOne(id: number) {
    return `This action returns a #${id} skill`;
  }

  update(id: number, updateSkillDto: UpdateSkillDto) {
    console.log(updateSkillDto);
    return `This action updates a #${id} skill`;
  }

  remove(id: number) {
    return `This action removes a #${id} skill`;
  }
}
