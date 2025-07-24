import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Skill } from './entities/skill.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill) private skillRepository: Repository<Skill>,
    @InjectRepository(User) private userRepository: Repository<User>,
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

      return savedSkill;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to update user',
        String(error),
      );
    }
  }

  async remove(userId: string, skillId: string) {
    try {
      const user = await this.userRepository.findOneOrFail({
        where: { id: userId },
      });

      const skill = await this.skillRepository.findOneOrFail({
        where: { id: skillId },
      });

      if (user.id == skill.owner.id)
        return await this.skillRepository.delete(skill.id);
      else {
        throw new ForbiddenException(
          'You do not have permission to delete this skill',
        );
      }
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to update user',
        String(error),
      );
    }
  }
}
