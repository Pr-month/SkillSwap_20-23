import { Injectable, NotFoundException,UnauthorizedException } from '@nestjs/common';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { Request } from './entities/request.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Skill } from '../skills/entities/skill.entity';
import { User } from '../users/entities/user.entity';
import { ReqStatus } from '../common/requests-status.enum';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private requestRepository: Repository<Request>,
    @InjectRepository(Skill)
    private skillRepository: Repository<Skill>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createRequestDto: CreateRequestDto, senderId: string) {
    //console.log(createRequestDto);
    //return 'This action adds a new request';

     // Проверяем существование отправителя
    const sender = await this.userRepository.findOne({ 
      where: { id: senderId },
    });
    if (!sender) {
      throw new NotFoundException(`Sender with ID ${senderId} not found`);
    }

    // Получаем навыки
    const [offeredSkill, requestedSkill] = await Promise.all([
      this.skillRepository.findOne({ 
        where: { id: createRequestDto.offeredSkillId },
        relations: ['owner'],
      }),
      this.skillRepository.findOne({ 
        where: { id: createRequestDto.requestedSkillId },
        relations: ['owner'],
      }),
    ]);

    if (!offeredSkill || !requestedSkill) {
      throw new NotFoundException('One or both skills not found');
    }

    // Проверяем, что отправитель - владелец предлагаемого навыка
    if (offeredSkill.owner.id !== senderId) {
      throw new UnauthorizedException('You can only offer your own skills');
    }

    // Создаем заявку
    const request = this.requestRepository.create({
      sender,
      receiver: requestedSkill.owner,
      offeredSkill,
      requestedSkill,
      status: ReqStatus.PENDING,
      isRead: false,
    });

    return this.requestRepository.save(request);
  }

  findAll() {
    return this.requestRepository.find();
  }

  findOne(id: string) {
    return this.requestRepository.findOne({ where: { id } });
  }

  async update(id: string, updateRequestDto: UpdateRequestDto) {
    //console.log(updateRequestDto);
    //return `This action updates a #${id} request`;

    // Находим запрос
    const request = await this.requestRepository.findOne({
      where: { id },
      relations: ['sender', 'receiver', 'offeredSkill', 'requestedSkill'],
    });

    if (!request) {
      throw new NotFoundException(`Request with ID ${id} not found`);
    }
    // Обновляем только разрешенные поля
    if (updateRequestDto.status !== undefined) {
      request.status = updateRequestDto.status;
    }
    if (updateRequestDto.isRead !== undefined) {
      request.isRead = updateRequestDto.isRead;
    }

    // Сохраняем обновленный запрос
    return this.requestRepository.save(request);
  }

  remove(id: string) {
    return this.requestRepository.delete(id);
  }
}
