import { Request } from 'src/requests/entities/request.entity';
import { NotificationsService } from './notifications.service';
import { User } from 'src/users/entities/user.entity';
import { Gender, Role } from 'src/common/types';
import { ReqStatus } from 'src/common/requests-status.enum';
import { Skill } from 'src/skills/entities/skill.entity';
import { Server } from 'socket.io';
import { sendMessageToUserPayload } from './guards/types';

describe('NotificationsService', () => {
  let notificationsService: NotificationsService;

  const mockServer = {
    to: jest.fn().mockReturnThis(),
    emit: jest.fn(),
  } as unknown as jest.Mocked<Server>;

  const mockSender: User = {
    id: 'mock-sender-id',
    name: 'Han-Solo',
    email: 'star@wars.com',
    password: 'mock-han-pass',
    about: 'Ha-ha-ha',
    birthDate: null,
    city: 'Corellia',
    gender: Gender.MALE,
    role: Role.USER,
    avatar: './han-solo.jpeg',
    refreshToken: '',
  };

  const mockReceiver: User = {
    id: 'mock-receiver-id',
    name: 'Leya Organa',
    email: 'wars@star.com',
    password: 'mock-leya-pass',
    about: 'XD',
    birthDate: null,
    city: 'Aldeaan',
    gender: Gender.FEMALE,
    role: Role.ADMIN,
    avatar: './leya.gif',
    refreshToken: '',
  };

  const mockOfferedSkill: Skill = {
    id: 'offered-skills-id',
    title: 'mock-offered-skill-title',
    description: 'mock-offered=skill-description',
    images: [],
    owner: mockSender,
    category: {
      id: 'mock-category-id',
      name: 'mock-category-name',
    },
  };

  const mockRequestedSkill: Skill = {
    id: 'requested-skills-id',
    title: 'mock-requested-skill-title',
    description: 'mock-requested-skill-description',
    images: [],
    owner: mockSender,
    category: {
      id: 'mock-category-id',
      name: 'mock-category-name',
    },
  };

  const request: Request = {
    id: '',
    createdAt: new Date(),
    sender: mockSender,
    receiver: mockReceiver,
    status: ReqStatus.PENDING,
    offeredSkill: mockOfferedSkill,
    requestedSkill: mockRequestedSkill,
    isRead: true,
  };

  beforeEach(() => {
    notificationsService = new NotificationsService();
    notificationsService.socket = mockServer;
  });

  describe('notifyNewRequest', () => {
    it('Должен отправлять запрос по id', () => {
      const notificationMessage = `Пользователь ${request.sender.name} предлагает обмен навыка ${request.requestedSkill.title} на ${request.offeredSkill.title} с вами, ${request.receiver.name}!`;

      const mockServerTo = jest.spyOn(mockServer, 'to');
      const mockServerEmit = jest.spyOn(mockServer, 'emit');

      const mockNotificationMethod = jest
        .spyOn(notificationsService, 'notifyNewRequest')
        .mockImplementation((req) => {
          mockServer.to(req.receiver.id);
          mockServer.emit('notifyRequest', notificationMessage);
        });

      notificationsService.notifyNewRequest(request);

      expect(mockNotificationMethod).toHaveBeenCalledWith(request);
      expect(mockServerTo).toHaveBeenCalledWith(request.receiver.id);
      expect(mockServerEmit).toHaveBeenCalledWith(
        'notifyRequest',
        notificationMessage,
      );
    });
  });

  describe('notifyUpdateRequest', () => {
    it('Обновление текста запрса, когда статус запроса accepted', () => {
      const acceptedRequest = {
        ...request,
        status: ReqStatus.ACCEPTED,
      };

      const notificationMessage = `Пользователь ${acceptedRequest.receiver.name} согласился обменятся навыком ${acceptedRequest.requestedSkill.title} на ${acceptedRequest.offeredSkill.title} с вами, ${acceptedRequest.sender.name}!`;

      const mockServerTo = jest.spyOn(mockServer, 'to');
      const mockServerEmit = jest.spyOn(mockServer, 'emit');

      const mockNotificationMethod = jest
        .spyOn(notificationsService, 'notifyUpdateRequest')
        .mockImplementation((req) => {
          mockServer.to(req.receiver.id);
          mockServer.emit('notifyRequest', notificationMessage);
        });

      notificationsService.notifyUpdateRequest(acceptedRequest);

      expect(mockNotificationMethod).toHaveBeenCalledWith(acceptedRequest);
      expect(mockServerTo).toHaveBeenCalledWith(acceptedRequest.receiver.id);
      expect(mockServerEmit).toHaveBeenCalledWith(
        'notifyRequest',
        notificationMessage,
      );
    });
  });

  describe('notifyNewMessage', () => {
    it('Получение нового сообщения', () => {
      const client: string = 'client';
      const mockPayload: sendMessageToUserPayload = {
        text: 'mock-text',
        reciever: 'mock-reciever',
        sender: 'mock-sender',
      };

      const payloadMessage = `Поступило письмо для ${mockPayload.reciever} от ${mockPayload.sender}\n${mockPayload.text}!`;

      const mockServerTo = jest.spyOn(mockServer, 'to');
      const mockServerEmit = jest.spyOn(mockServer, 'emit');

      const mockNotificationMethod = jest
        .spyOn(notificationsService, 'notifyNewMessage')
        .mockImplementation(() => {
          mockServer.to(mockPayload.reciever);
          mockServer.emit('sendMessageToUser', payloadMessage);
        });

      notificationsService.notifyNewMessage(client, mockPayload);

      expect(mockNotificationMethod).toHaveBeenCalledWith(client, mockPayload);
      expect(mockServerTo).toHaveBeenCalledWith(mockPayload.reciever);
      expect(mockServerEmit).toHaveBeenCalledWith(
        'sendMessageToUser',
        payloadMessage,
      );
    });
  });
});
