// ЭТОТ ФАЙЛ СЛЕДУЕТ УДАЛИТЬ
//ВНИМАНИЕ! Это МОК-ЗАТЫЧКА ОНА НЕ ДОЛЖНА ПОПАСТЬ В ПРОД
import { BadRequestException, Injectable } from '@nestjs/common';
//import * as bcrypt from 'bcrypt';

// TO DO: ВНИМАНИЕ ЭТО БЛОК ВРЕМЕННАЯ ЗАТЫЧКА, ЕЕ НУЖНО УДАЛИТЬ!
// УДАЛИТЬ ОТСЮДА
type Gender = 'male' | 'female';
type Role = 'USER' | 'ADMIN';

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  age: number;
  city: string;
  gender: Gender;
  avatar: string;
  role: Role;
  refreshToken: string;
};
// И ДОСЮДА

@Injectable()
export class UsersService {
  private readonly users: User[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@email.com',
      password: '$2b$10$pCHdOHoXp7sP0zPWuk05sujC4tDdB5Z1ZqVi7rIPS8KxvBQh9UFmy', //a value taken by doing bcrypt.hash('johndoesecretpassword', this.bcryptSalt); with bcryptSalt = 10
      age: 30,
      city: 'Moscow',
      gender: 'male',
      avatar: 'link/to/avatar.jpg',
      role: 'ADMIN',
      refreshToken: 'SOMERANDOMTOKEN',
    },
    {
      id: '2',
      name: 'Jane Doe',
      email: 'doeJane@email.com',
      password: '$2b$10$KaVaAuk2h7zTvoZMMon7E.Oalv82rifj09Fmr5XHLfofHOX14oKlS', //a value taken by doing bcrypt.hash('janedoesecretpassword', this.bcryptSalt); with bcryptSalt = 10
      age: 28,
      city: 'St. Petersburg',
      gender: 'female',
      avatar: 'link/to/avatar2.jpg',
      role: 'USER',
      refreshToken: 'SOMEREALLYRANDOMTOKEN',
    },
  ];

  async findOne(username: string): Promise<User | undefined> {
    //ЭТО МОК функция ее нужно удалить
    // eslint-disable-next-line @typescript-eslint/await-thenable
    const response = await this.users.find((user) => user.name === username);
    return response;
  }

  async updateRefreshToken(userId: string, newRefreshToken: string) {
    //ЭТО МОК функция ее нужно удалить
    // eslint-disable-next-line @typescript-eslint/await-thenable
    const user = await this.users.find((user) => user.id === userId);
    const userIndex = this.users.findIndex((user) => user.id === userId);
    if (!user || !userIndex) {
      throw new BadRequestException('Пользователь не найден');
    }
    user.refreshToken = newRefreshToken;
    this.users[userIndex] = user;
    return user;
  }
}
