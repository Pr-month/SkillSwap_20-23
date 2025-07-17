import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { dataUsers } from './data/users';

@Injectable()
export class UsersService {
  create(createUserDto: CreateUserDto) {
    //Затычка линтинга
    console.log('Creating a user:');
    console.log(createUserDto);
    return 'This action adds a new user';
  }

  findAll() {
    return dataUsers;
  }

  findMe() {
    return dataUsers[0];
  }

  findOne(id: number) {
    return dataUsers[id - 1];
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    //Затычка линтинга
    console.log('Updating a user:');
    console.log(updateUserDto);
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
