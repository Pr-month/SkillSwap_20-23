import { Module } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { SkillsController } from './skills.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Skill } from './entities/skill.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Skill, User]), // Регистрация репозитория Skill
  ],
  controllers: [SkillsController],
  providers: [SkillsService],
})
export class SkillsModule {}
