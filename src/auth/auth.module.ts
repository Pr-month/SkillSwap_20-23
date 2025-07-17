import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
//import { UsersModule } from 'src/users/users.module';
//import { UsersService } from 'src/users/users.service';
import { UsersModule } from 'src/usersMock/usersMock.module'; // Это моки затычки чтобы проверить работоспособность Auth Login
import { UsersService } from 'src/usersMock/usersMock.service'; // Это моки затычки чтобы проверить работоспособность Auth Login

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [AuthService, UsersService],
})
export class AuthModule {}
