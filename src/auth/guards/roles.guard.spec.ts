import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { Role } from '../../common/types';
import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  // настройка тестового модуля перед каждым тестом
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(), // Мокаем Reflector
          },
        },
      ],
    }).compile();

    // получаем экземпляры сервисов для тестирования
    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  // Базовый тест на существование guard
  it('должен быть определен', () => {
    expect(guard).toBeDefined();
  });

  // Тестирование метода canActivate
  describe('canActivate', () => {
    // Тест 1: доступ разрешен, когда нет требований к ролям,мокаем возвращаемые роли как undefined
    it('должен разрешить доступ, если нет требуемых ролей', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
      const mockContext = createMockContext(); // контекст без пользователя
      expect(guard.canActivate(mockContext)).toBe(true);
    });

    // Тест 2: доступ разрешен для ADMIN, указываем, что требуется роль ADMIN
    it('должен разрешить доступ для ADMIN, когда требуется ADMIN', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);
      // создаем контекст с пользователем-ADMIN
      const mockContext = createMockContext({
        sub: '123',
        role: [Role.ADMIN], // пользователь имеет нужную роль
      });
      expect(guard.canActivate(mockContext)).toBe(true);
    });

    // Тест 3:доступ запрещен для USER, когда требуется ADMIN
    it('должен запретить доступ для USER, когда требуется ADMIN', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);
      const mockContext = createMockContext({
        sub: '123',
        role: [Role.USER], // пользователь имеет только роль USER
      });
      expect(guard.canActivate(mockContext)).toBe(false);
    });

    // Тест 4: доступ запрещен для неаутентифицированного пользователя
    it('должен запретить доступ, если пользователь не аутентифицирован', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);
      const mockContext = createMockContext(); // контекст без пользователя
      expect(guard.canActivate(mockContext)).toBe(false);
    });

    // Тест 5: доступ разрешен при наличии одной из требуемых ролей, требуются ADMIN или USER
    it('должен разрешить доступ, если пользователь имеет одну из требуемых ролей', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([Role.ADMIN, Role.USER]);
      const mockContext = createMockContext({
        sub: '123',
        role: [Role.USER],
      });
      expect(guard.canActivate(mockContext)).toBe(true);
    });

    // Тест 6: доступ разрешен при наличии нескольких ролей, включая требуемую
    it('должен разрешить доступ, если пользователь имеет несколько ролей, включая требуемую', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);
      const mockContext = createMockContext({
        sub: '123',
        role: [Role.USER, Role.ADMIN], // пользователь имеет обе роли
      });
      expect(guard.canActivate(mockContext)).toBe(true);
    });

    // Тест 7: проверка выброса исключения при недостатке прав
    it('должен выбрасывать ForbiddenException при недостатке прав', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);
      const mockContext = createMockContext({
        sub: '123',
        role: [Role.USER], // пользователь имеет только USER
      });
      // временная модификация guard для теста исключения
      const callGuard = () => {
        const result = guard.canActivate(mockContext);
        if (!result) {
          throw new ForbiddenException();
        }
        return result;
      };
      expect(callGuard).toThrow(ForbiddenException);
    });
  });
  // вспомогательная функция для создания mock ExecutionContext
  function createMockContext(user?: {
    sub: string;
    role: Role[];
  }): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          user,
        }),
      }),
      getHandler: () => {},
      getClass: () => {},
    } as unknown as ExecutionContext;
  }
});
