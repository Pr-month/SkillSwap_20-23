import {
  Controller,
  Request,
  Get,
  Body,
  Patch,
  Param,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RequestWithGuard, UpdateUserDto } from './dto/update-user.dto';
import { AccessTokenGuard } from 'src/auth/guards/accessToken.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getMe(@Request() req: RequestWithGuard) {
    const currentUser = await this.usersService.findUserById(req.user.userId);
    return currentUser;
  }

  @UseGuards(AccessTokenGuard)
  @Patch('me')
  async updateMe(
    @Request() req: RequestWithGuard,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    try {
      const response = await this.usersService.updateUserById(
        req.user.userId, // ID пользователя
        updateUserDto,
      );
      return response;
    } catch {
      throw new BadRequestException('Ошибка при обновлении пользователя');
    }
  }
}
