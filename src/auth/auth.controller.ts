import {
  Body,
  Controller,
  HttpCode, HttpStatus,
  Post
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { signInDto } from './dto/signInDto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  create(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.create(createAuthDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() userData: signInDto) {
    return this.authService.signIn(userData);
  }
}
