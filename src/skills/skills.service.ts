import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { Skill } from './entities/skill.entity';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill) private skillRepository: Repository<Skill>,
    private readonly userService: UsersService,
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

  remove(id: number) {
    return `This action removes a #${id} skill`;
  }
}
