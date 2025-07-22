import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserSkill } from './entities/user_skill.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserSkill]), // Регистрация репозитория User
  ],
  controllers: [UsersController],
  providers: [UsersService, AccessTokenGuard],
  exports: [UsersService],
})
export class UsersModule {}
