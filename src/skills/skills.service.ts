import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
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

  findAll() {
    return `This action returns all skills`;
  }

  findOne(id: number) {
    return `This action returns a #${id} skill`;
  }

  async update(id: string, updateSkillDto: UpdateSkillDto) {
    const skill = await this.skillRepository.findOne({
      where: {
        id,
      },
    });

    if (!skill) {
      throw new NotFoundException('Skill not found!');
    }

    return this.skillRepository.save({
      ...skill,
      ...updateSkillDto,
    });
  }

  remove(id: number) {
    return `This action removes a #${id} skill`;
  }
}
