import { Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
  ) {}

  async create(createAuthDto: CreateAuthDto) {

    const { password } = createAuthDto;

    const saltRound = 10;

    const passwordHash: string = await bcrypt.hash(password, saltRound);
    const newUser = {
      ...createAuthDto,
      password: passwordHash,
    }

    try {
      this.usersService.create(newUser)
    } catch (err) {
      throw new Error(err)
    }
    
    return {
      user: newUser,
    }
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
