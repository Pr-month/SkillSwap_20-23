import { Injectable } from '@nestjs/common';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Skill } from './entities/skill.entity';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill) private skillRepository: Repository<Skill>,
  ) {}

  create(createSkillDto: CreateSkillDto) {
    console.log(createSkillDto);
    return 'This action adds a new skill';
  }

  async findAll(page: number, limit: number) {
    const [items, total] = await this.skillRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      relations: ['owner'],
    });

    console.log(page, limit);
    return { total, page, limit, items };
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
