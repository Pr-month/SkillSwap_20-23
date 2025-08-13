import {
  BadRequestException,
  ConflictException,
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { SkillsService } from '../skills/skills.service';
import { Repository } from 'typeorm';
import { QueryParamsDto } from './dto/query-param.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @Inject(forwardRef(() => SkillsService))
    private skillsService: SkillsService,
  ) {}

  async findAll(query: QueryParamsDto): Promise<{
    data: User[];
    page: number;
    totalPages: number;
  }> {
    const page = Math.max(parseInt(query.page ?? '1'), 1);
    const take = Math.min(Math.max(parseInt(query.limit ?? '20'), 1), 100);
    const skip = (page - 1) * take;

    const [users, total] = await this.userRepository.findAndCount({
      take,
      skip,
    });

    const totalPages = Math.ceil(total / take);

    if (page > totalPages)
      throw new HttpException('Страница не найдена', HttpStatus.NOT_FOUND);

    return {
      data: plainToInstance(User, users),
      page,
      totalPages,
    };
  }

  async findUserById(id: string) {
    const user = await this.userRepository.findOneOrFail({ where: { id } });
    return plainToInstance(User, user);
  }

  // OLD VERSION
  async findUsersBySkillId(skillId: string) {
    const skill = await this.skillsService.findOneWithCategory(skillId);

    return await this.userRepository.find({
      where: {
        wantToLearn: { id: skill.category.id },
      },
      take: 10,
    });
  }

  // Я предлагаю упростить вот так.
  async findUserBySkillId(skillId: string) {
    const skillOwner = await this.userRepository.findOne({
      where: {
        skills: { id: skillId },
      },
    });

    if (!skillOwner) {
      throw new NotFoundException('Не удалось найти владельца навыка...');
    }
    return skillOwner;
  }

  async updateUserById(id: string, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.userRepository.findOneOrFail({ where: { id } });
      const savedUser = await this.userRepository.save({
        ...user,
        ...updateUserDto,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, refreshToken, ...updatedUser } = savedUser;

      return updatedUser;
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      throw new InternalServerErrorException('Failed to update user', error);
    }
  }

  async updatePassword(
    userId: string, // Принимаем ID пользователя
    currentPassword: string, // Текущий пароль для проверки
    newPassword: string, // Новый пароль для установки
  ): Promise<void> {
    // Поиск пользователя с выборкой конкретных полей
    const user = await this.userRepository.findOneOrFail({
      where: { id: userId },
      select: ['id', 'password'], // Явно указываем нужные поля
    });

    // Проверка совпадения текущего пароля

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Неверный пароль');
    }

    // Проверка, что новый пароль не совпадает с текущим

    if (await bcrypt.compare(newPassword, user.password)) {
      throw new ConflictException('Новый пароль должен отличаться от текущего');
    }

    //Проверка минимальной длины нового пароля
    if (newPassword.length < 8) {
      throw new BadRequestException('Пароль должен быть не менее 8 символов');
    }

    // Хеширование нового пароля

    const hashedNewPassword = await bcrypt.hash(newPassword, 12); // Увеличили salt rounds

    user.password = hashedNewPassword; // Обновление пароля
    await this.userRepository.save(user); // Сохранение изменений
  }
}
