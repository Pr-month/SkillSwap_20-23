import {
  Controller,
  Request,
  Get,
  Body,
  Patch,
  BadRequestException,
  UseGuards,
  Param,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AccessTokenGuard } from 'src/auth/guards/accessToken.guard';
import { AuthGuard } from '@nestjs/passport';
import { RequestWithGuard, UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getMe(@Request() req: RequestWithGuard) {
    const currentUser = await this.usersService.findId(req.user.userId);
    return currentUser;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findId(id);
  }

  @UseGuards(AccessTokenGuard)
  @Patch('me')
  async updateMe(
    @Request() req: RequestWithGuard,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    try {
      const response = await this.usersService.updateUserById(
        req.user.userId,
        updateUserDto,
      );
      return response;
    } catch {
      throw new BadRequestException('Ошибка при обновлении пользователя');
    }
  }
}
