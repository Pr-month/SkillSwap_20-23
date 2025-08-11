import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { Request } from './entities/request.entity';
import { Repository, In } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Skill } from '../skills/entities/skill.entity';
import { User } from '../users/entities/user.entity';
import { ReqStatus } from '../common/requests-status.enum';
import { JwtPayload } from '../auth/auth.types';
import { Role } from 'src/common/types';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private requestRepository: Repository<Request>,
    @InjectRepository(Skill)
    private skillRepository: Repository<Skill>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private notificationsService: NotificationsService,
  ) {}

  async create(createRequestDto: CreateRequestDto, senderId: string) {
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

    // Отправляем уведомление о заявке
    this.notificationsService.notifyNewRequest(request);

    return this.requestRepository.save(request);
  }

  findAll() {
    return this.requestRepository.find();
  }

  async findIncoming(userId: string) {
    return this.requestRepository.find({
      where: {
        receiver: { id: userId },
        status: In([ReqStatus.PENDING, ReqStatus.INPROGRESS]),
      },
      relations: ['sender', 'offeredSkill', 'requestedSkill'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOutgoing(userId: string) {
    return this.requestRepository.find({
      where: {
        sender: { id: userId },
        status: In([ReqStatus.PENDING, ReqStatus.INPROGRESS]),
      },
      relations: ['receiver', 'offeredSkill', 'requestedSkill'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  findOne(id: string) {
    return this.requestRepository.findOne({ where: { id } });
  }

  async update(
    id: string,
    updateRequestDto: UpdateRequestDto,
    user: JwtPayload,
  ) {
    // Находим запрос
    const request = await this.requestRepository.findOne({
      where: { id },
      relations: ['sender', 'receiver', 'offeredSkill', 'requestedSkill'],
    });
    if (!request) {
      throw new NotFoundException(`Request with ID ${id} not found`);
    }
    // Проверяем права доступа
    if (user.role !== Role.ADMIN && user.sub !== request.receiver.id) {
      throw new UnauthorizedException(
        'You can only update your own received requests',
      );
    }
    // Обновляем только разрешенные поля
    if (updateRequestDto.status !== undefined) {
      request.status = updateRequestDto.status;
      // Автоматически помечаем как прочитанное при изменении статуса
      if (
        updateRequestDto.status === ReqStatus.ACCEPTED ||
        updateRequestDto.status === ReqStatus.REJECTED
      ) {
        request.isRead = true;
      }
    }
    // Уведомляем о запросе
    this.notificationsService.notifyUpdateRequest(request);

    // Сохраняем обновленный запрос
    return this.requestRepository.save(request);
  }

  async remove(userId: string, requestId: string) {
    try {
      const user = await this.userRepository.findOneOrFail({
        where: { id: userId },
      });
      const request = await this.requestRepository.findOneOrFail({
        where: { id: requestId },
        relations: ['sender'],
      });

      if (!request.sender)
        throw new BadRequestException('Reques has no sender');

      if (user.id === request.sender.id || user.role == Role.ADMIN)
        return await this.requestRepository.remove(request);
      else {
        throw new ForbiddenException(
          'You do not have permission to delete this request',
        );
      }
    } catch (error) {
      if (
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new InternalServerErrorException(
        'Failed to delete request',
        String(error),
      );
    }
  }
}
