import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { SkillsModule } from '../skills/skills.module';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // Регистрация репозитория User
    SkillsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, AccessTokenGuard],
  exports: [UsersService],
})
export class UsersModule {}
