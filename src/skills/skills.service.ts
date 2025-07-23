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

  async create(createSkillDto: CreateSkillDto): Promise<Skill> {
    try {
      const newSkill = this.skillRepository.create(createSkillDto) as Skill;
      return await this.skillRepository.save(newSkill);
    } catch (error) {
      throw new Error('Ошибка при создании навыка: ' + error.message);
    }
  }

  async findAll(): Promise<Skill[]> {
    return await this.skillRepository.find();
  }

  findOne(id: string): Promise<Skill> {
    const skill = this.skillRepository.findOneOrFail({ where: { id } });
    return skill
  }

  update(id: number, updateSkillDto: UpdateSkillDto) {
    console.log(updateSkillDto);
    return `This action updates a #${id} skill`;
  }

  remove(id: string) {
    return this.skillRepository.delete(id);
  }
}
