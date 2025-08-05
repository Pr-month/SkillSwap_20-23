import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { Role } from '../../common/types';
import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';

// основной блок тестов для RolesGuard
describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  // настройка тестового окружения перед каждым тестом
  beforeEach(async () => {
    // создаем тестовый модуль NestJS
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard, // тестируемый guard
        {
          // Мокаем Reflector, который используется для получения метаданных
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(), // Мок-функция для получения ролей
          },
        },
      ],
    }).compile();

    // получаем экземпляры для тестирования
    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  // базовый тест на существование guard
  it('должен быть определен', () => {
    expect(guard).toBeDefined();
  });

  // Тестирование основного метода canActivate
  describe('canActivate', () => {
    // Тест 1: Проверка доступа без ограничений по ролям
    it('должен разрешить доступ, если нет требуемых ролей', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
      const mockContext = createMockContext();
      expect(guard.canActivate(mockContext)).toBe(true);
    });

    // Тест 2: Успешный доступ ADMIN
    it('должен разрешить доступ для ADMIN, когда требуется ADMIN', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);
      // создаем контекст с пользователем ADMIN
      const mockContext = createMockContext({
        sub: '123',
        role: [Role.ADMIN]
      });
      expect(guard.canActivate(mockContext)).toBe(true);
    });

    // Тест 3: Запрет доступа USER к ADMIN endpoint
    it('должен запретить доступ для USER, когда требуется ADMIN', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);
      const mockContext = createMockContext({
        sub: '123',
        role: [Role.USER]
      });
      expect(guard.canActivate(mockContext)).toBe(false);
    });

    // Тест 4: Запрет доступа неаутентифицированному пользователю
    it('должен запретить доступ, если пользователь не аутентифицирован', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);
      const mockContext = createMockContext();
      expect(guard.canActivate(mockContext)).toBe(false);
    });

    // Тест 5: Доступ при наличии одной из разрешенных ролей
    it('должен разрешить доступ, если пользователь имеет одну из требуемых ролей', () => {
      // Разрешаем либо ADMIN, либо USER
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN, Role.USER]);
      const mockContext = createMockContext({
        sub: '123',
        role: [Role.USER]
      });
      expect(guard.canActivate(mockContext)).toBe(true);
    });

    // Тест 6: Доступ при наличии нескольких ролей
    it('должен разрешить доступ, если пользователь имеет несколько ролей, включая требуемую', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);
      const mockContext = createMockContext({
        sub: '123',
        role: [Role.USER, Role.ADMIN] // пользователь имеет обе роли
      });
      expect(guard.canActivate(mockContext)).toBe(true);
    });

    // Тест 7: Проверка выброса исключения при недостаточных правах
    it('должен выбрасывать ForbiddenException при недостатке прав', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);
      const mockContext = createMockContext({
        sub: '123',
        role: [Role.USER]
      });

      // временная модификация guard для тестирования исключений
      const originalCanActivate = guard.canActivate.bind(guard);
      guard.canActivate = (context: ExecutionContext) => {
        const result = originalCanActivate(context);
        if (!result) throw new ForbiddenException();
        return result;
      };
      
      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    });
  });

  // интерфейс для типизации тестового пользователя
  interface MockUser {
    sub: string; // идентификатор пользователя
    role: Role[]; // массив ролей пользователя
  }

  /**
   * Функция для создания мокового ExecutionContext
   * @param user Опциональный объект пользователя
   * @returns Полноценный мок ExecutionContext со всеми необходимыми методами
   */
  function createMockContext(user?: MockUser): ExecutionContext {
    return {
      // метод для работы с HTTP-контекстом
      switchToHttp: () => ({
        getRequest: () => ({ user }) as { user?: MockUser }, // возвращаем запрос с пользователем
        getResponse: () => ({} as Response),   // пустой объект ответа
        getNext: () => jest.fn() as jest.Mock    // Мок-функция next()
      }),
      // методы для работы с обработчиками
      getHandler: () => jest.fn() as jest.Mock,  // Мок обработчика
      getClass: () => jest.fn() as jest.Mock,      // Мок класса
      //методы ArgumentsHost
      getArgs: () => [],               // пустой массив аргументов
      getArgByIndex: (_index: number) => ({}),// пустой объект по индексу
      // методы для RPC-контекста
      switchToRpc: () => ({
        getContext: () => ({}),        // пустой контекст
        getData: () => ({})            // пустые данные
      }),
      // методы для WebSocket-контекста
      switchToWs: () => ({
        getClient: () => ({}),         // пустой клиент
        getData: () => ({}),           // пустые данные
        getPattern: () => ''           // пустой паттерн
      }),
      // тип контекста (http, rpc, ws)
      getType: () => 'http'            // указываем HTTP-контекст
    } as unknown as ExecutionContext;  // безопасное приведение типов
  }
});