import { Injectable } from '@nestjs/common';
import { dataUsers } from './data/users';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from './entities/users.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
  ) {}

  async findAll(): Promise<Users[]> {
    return this.usersRepository.find();
  }

  findMe(id: number) {
    return this.usersRepository.findOne({where: {id}});
  }

  findId(id: number) {
    return this.usersRepository.findOne({where: {id}});
  }
}
