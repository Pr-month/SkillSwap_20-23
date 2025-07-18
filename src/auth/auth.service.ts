import { Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  create(createAuthDto: CreateAuthDto) {
    //Затычка линтинга
    console.log(createAuthDto);
    const { password } = createAuthDto;
    const saltRound = 10;
    return 'This action adds a new auth';
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    //Затычка линтинга
    console.log(updateAuthDto);
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
