import { Test, TestingModule } from '@nestjs/testing';
import { RequestsService } from './requests.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Request } from './entities/request.entity';
import { Skill } from '../skills/entities/skill.entity';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateRequestDto } from './dto/create-request.dto';
import { ReqStatus } from '../common/requests-status.enum';
import { NotificationsService } from '../notifications/notifications.service';
import { Role } from 'src/common/types';
import { Gender } from 'src/common/gender.enum';
import { v4 as uuidv4 } from 'uuid';
import { JwtPayload } from '../auth/auth.types';

describe('RequestsService', () => {
  let service: RequestsService;
  let requestRepository: Repository<Request>;
  let skillRepository: Repository<Skill>;
  let userRepository: Repository<User>;
  let notificationsService: NotificationsService;

  // Фабричная функция для создания тестового пользователя
  function createTestUser(overrides: Partial<User> = {}): User {
    const defaults: User = {
      id: uuidv4(),
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashed-password',
      about: null,
      birthDate: null,
      city: null,
      gender: Gender.MALE,
      avatar: '',
      role: Role.USER,
      refreshToken: 'refresh-token',
      skills: [],
      sentRequests: [],
      receivedRequests: [],
      favoriteSkills: [],
      wantToLearn: [],
    };

    return { ...defaults, ...overrides };
  }

  // настройка тестового модуля перед каждым тестом
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestsService,
        // мокируем репозитории TypeORM
        {
          provide: getRepositoryToken(Request),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Skill),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        // мокируем сервис уведомлений
        {
          provide: NotificationsService,
          useValue: {
            notifyNewRequest: jest.fn(),
            notifyUpdateRequest: jest.fn(),
          },
        },
      ],
    }).compile();

    // получаем экземпляры сервисов и репозиториев
    service = module.get<RequestsService>(RequestsService);
    requestRepository = module.get<Repository<Request>>(
      getRepositoryToken(Request),
    );
    skillRepository = module.get<Repository<Skill>>(getRepositoryToken(Skill));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    notificationsService =
      module.get<NotificationsService>(NotificationsService);
  });

  // базовый тест на создание сервиса
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // тесты для метода create()
  describe('create()', () => {
    it('успешное создание заявки', async () => {
      // подготовка тестовых данных
      const createRequestDto: CreateRequestDto = {
        offeredSkillId: 'offered-skill-id',
        requestedSkillId: 'requested-skill-id',
      };

      const sender = createTestUser({ id: 'sender-id' });
      const receiver = createTestUser({ id: 'receiver-id' });
      const offeredSkill = {
        id: 'offered-skill-id',
        owner: sender,
      } as Skill;
      const requestedSkill = {
        id: 'requested-skill-id',
        owner: receiver,
      } as Skill;
      const expectedRequest = {
        sender,
        receiver,
        offeredSkill,
        requestedSkill,
        status: ReqStatus.PENDING,
        isRead: false,
      } as Request;

      // мокируем методы репозиториев
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(sender);
      jest
        .spyOn(skillRepository, 'findOne')
        .mockResolvedValueOnce(offeredSkill as Skill)
        .mockResolvedValueOnce(requestedSkill as Skill);
      jest.spyOn(requestRepository, 'create').mockReturnValue(expectedRequest);
      jest.spyOn(requestRepository, 'save').mockResolvedValue(expectedRequest);

      // вызываем тестируемый метод
      const result = await service.create(createRequestDto, sender.id);

      // проверяем результаты
      expect(result).toEqual(expectedRequest);
      expect(notificationsService.notifyNewRequest).toHaveBeenCalledWith(
        expectedRequest,
      );
    });

    it('ошибка, если отправитель не найден', async () => {
      // мокируем несуществующего пользователя
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      // проверяем, что будет выброшено исключение
      await expect(
        service.create({} as CreateRequestDto, 'non-existent-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('ошибка, если один из навыков не найден', async () => {
      const sender = createTestUser({ id: 'sender-id' });
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(sender);
      // мокируем, что один из навыков не найден
      jest
        .spyOn(skillRepository, 'findOne')
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({} as Skill);

      await expect(
        service.create(
          {
            offeredSkillId: 'non-existent-skill',
            requestedSkillId: 'existent-skill',
          } as CreateRequestDto,
          sender.id,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('ошибка, если пользователь пытается предложить чужой навык', async () => {
      const sender = createTestUser({ id: 'sender-id' });
      const otherUser = createTestUser({ id: 'other-user-id' });
      const offeredSkill = {
        id: 'offered-skill-id',
        owner: otherUser,
      } as Skill;
      const requestedSkill = { id: 'requested-skill-id' } as Skill;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(sender);
      jest
        .spyOn(skillRepository, 'findOne')
        .mockResolvedValueOnce(offeredSkill)
        .mockResolvedValueOnce(requestedSkill);

      // проверяем, что будет выброшено исключение о невозможности предложить чужой навык
      await expect(
        service.create(
          {
            offeredSkillId: offeredSkill.id,
            requestedSkillId: requestedSkill.id,
          } as CreateRequestDto,
          sender.id,
        ),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
  // тесты для метода findIncoming()
  describe('findIncoming()', () => {
    it('возвращает входящие заявки', async () => {
      const userId = 'user-id';
      const expectedRequests = [
        { id: 'request-1', receiver: { id: userId } },
        { id: 'request-2', receiver: { id: userId } },
      ] as Request[];

      // мокируем возвращаемые заявки
      jest.spyOn(requestRepository, 'find').mockResolvedValue(expectedRequests  as Request[]);

      const result = await service.findIncoming(userId);

      // проверяем результат и параметры вызова
      expect(result).toEqual(expectedRequests);
      expect(requestRepository.find).toHaveBeenCalledWith({
        where: {
          receiver: { id: userId },
          status: expect.anything(), // проверяем In([PENDING, INPROGRESS])
        },
        relations: expect.arrayContaining([
          'sender',
          'offeredSkill',
          'requestedSkill',
        ]),
        order: {
          createdAt: 'DESC',
        },
      });
    });
  });

  // тесты для метода findOutgoing()
  describe('findOutgoing()', () => {
    it('возвращает исходящие заявки', async () => {
      const userId = 'user-id';
      const expectedRequests = [
        { id: 'request-1', sender: { id: userId } },
        { id: 'request-2', sender: { id: userId } },
      ] as Request[];

      jest.spyOn(requestRepository, 'find').mockResolvedValue(expectedRequests  as Request[]);

      const result = await service.findOutgoing(userId);

      expect(result).toEqual(expectedRequests);
      // проверяем параметры запроса к БД
      expect(requestRepository.find).toHaveBeenCalledWith({
        where: {
          sender: { id: userId },
          status: expect.anything(), // проверяем In([PENDING, INPROGRESS])
        },
        relations: expect.arrayContaining([
          'receiver',
          'offeredSkill',
          'requestedSkill',
        ]),
        order: {
          createdAt: 'DESC',
        },
      });
    });
  });

  // тесты для метода update()
  describe('update()', () => {
    it('успешное обновление статуса заявки', async () => {
      const requestId = 'request-id';
      const receiverId = 'receiver-id';
      const updateDto = { status: ReqStatus.ACCEPTED };
      const existingRequest = {
        id: requestId,
        status: ReqStatus.PENDING,
        isRead: false,
        receiver: { id: receiverId },
      } as Request;
      const updatedRequest = {
        ...existingRequest,
        status: ReqStatus.ACCEPTED,
        isRead: true,
      } as Request;

      // мокируем методы репозиториев
      jest
        .spyOn(requestRepository, 'findOne')
        .mockResolvedValue(existingRequest as Request);
      jest.spyOn(requestRepository, 'save').mockResolvedValue(updatedRequest);

      // создаем корректный JwtPayload
      const jwtPayload: JwtPayload = {
        sub: receiverId,
        role: Role.USER,
        email: 'test@example.com',
      };

      // вызываем метод обновления
      const result = await service.update(requestId, updateDto, jwtPayload);

      // проверяем результаты
      expect(result.status).toBe(ReqStatus.ACCEPTED);
      expect(result.isRead).toBe(true);
      // проверяем вызов уведомления
      expect(notificationsService.notifyUpdateRequest).toHaveBeenCalledWith(
        updatedRequest,
      );
    });

    it('ошибка, если заявка не найдена', async () => {
      jest.spyOn(requestRepository, 'findOne').mockResolvedValue(null);

      const jwtPayload: JwtPayload = {
        sub: 'some-user-id',
        email: 'user@example.com',
        role: Role.USER,
      };

      await expect(
        service.update('non-existent-id', {}, jwtPayload),
      ).rejects.toThrow(NotFoundException);
    });

    it('ошибка, если пользователь не получатель и не админ', async () => {
      const request = {
        id: 'request-id',
        receiver: { id: 'receiver-id' },
      } as Request;

      jest.spyOn(requestRepository, 'findOne').mockResolvedValue(request);

      const jwtPayload: JwtPayload = {
        sub: 'other-user-id',
        email: 'other@example.com',
      };

      // пытаемся обновить от имени другого пользователя
      await expect(service.update(request.id, {}, jwtPayload)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('админ может обновлять любую заявку', async () => {
      const request = {
        id: 'request-id',
        receiver: { id: 'receiver-id' },
        status: ReqStatus.PENDING,
      } as Request;
      const updateDto = { status: ReqStatus.ACCEPTED };

      jest.spyOn(requestRepository, 'findOne').mockResolvedValue(request);
      jest.spyOn(requestRepository, 'save').mockResolvedValue({
        ...request,
        status: ReqStatus.ACCEPTED,
      } as Request);

      const adminPayload: JwtPayload = {
        sub: 'admin-id',
        role: Role.ADMIN,
        email: 'admin@example.com',
      };

      // проверяем, что админ может обновить
      await expect(
        service.update(request.id, updateDto, adminPayload),
      ).resolves.toBeDefined();
    });
  });
  // тесты для метода remove()
  describe('remove()', () => {
    it('отправитель может удалить свою заявку', async () => {
      const userId = 'user-id';
      const requestId = 'request-id';

      // создаем мок пользователя и заявки, где пользователь - отправитель
      const user = createTestUser({ id: userId });
      const request = {
        id: requestId,
        sender: user,
      } as Request;

      // мокируем методы репозиториев
      jest.spyOn(userRepository, 'findOneOrFail').mockResolvedValue(user);
      jest.spyOn(requestRepository, 'findOneOrFail').mockResolvedValue(request as Request);
      jest.spyOn(requestRepository, 'remove').mockResolvedValue(request);

      // проверяем успешное удаление
      await expect(service.remove(userId, requestId)).resolves.toEqual(request);
    });

    it('админ может удалить любую заявку', async () => {
      const adminId = 'admin-id';
      const requestId = 'request-id';
      const request = {
        id: requestId,
        sender: { id: 'other-user-id' },
      } as Request;

      // мокируем админа
      jest
        .spyOn(userRepository, 'findOneOrFail')
        .mockResolvedValue({ id: adminId, role: 'admin' } as User);
      jest.spyOn(requestRepository, 'findOneOrFail').mockResolvedValue(request as Request);
      jest.spyOn(requestRepository, 'remove').mockResolvedValue(request);

      // проверяем, что админ может удалить чужую заявку
      await expect(service.remove(adminId, requestId)).resolves.toEqual(
        request,
      );
    });

    it('ошибка, если пользователь не отправитель и не админ', async () => {
      const userId = 'user-id';
      const requestId = 'request-id';
      const request = {
        id: requestId,
        sender: { id: 'other-user-id' },
      } as Request;

      jest.spyOn(userRepository, 'findOneOrFail').mockResolvedValue({} as User);
      jest.spyOn(requestRepository, 'findOneOrFail').mockResolvedValue(request as Request);

      // проверяем, что будет выброшено исключение
      await expect(service.remove(userId, requestId)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('ошибка, если заявка не имеет отправителя', async () => {
      const userId = 'user-id';
      const requestId = 'request-id';

      // создаем заявку без отправителя
      const request = {
        id: requestId,
        createdAt: new Date(),
        receiver: { id: 'receiver-id' } as User,
        status: ReqStatus.PENDING,
        offeredSkill: { id: 'offered-skill-id' } as Skill,
        requestedSkill: { id: 'requested-skill-id' } as Skill,
        isRead: false,
        // sender отсутствует
      } as Request;

      jest.spyOn(userRepository, 'findOneOrFail').mockResolvedValue({} as User);
      jest.spyOn(requestRepository, 'findOneOrFail').mockResolvedValue(request as Request);

      // проверяем обработку случая с отсутствующим отправителем
      await expect(service.remove(userId, requestId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('обработка внутренних ошибок при удалении', async () => {
      // мокируем ошибку в репозитории
      jest
        .spyOn(userRepository, 'findOneOrFail')
        .mockRejectedValue(new Error('DB error'));

      // проверяем преобразование ошибки в InternalServerErrorException
      await expect(service.remove('user-id', 'request-id')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
