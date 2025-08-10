import { Test, TestingModule } from '@nestjs/testing';
import { RefreshTokenGuard } from './refresh-token.guard';
import { RefreshTokenStrategy } from '../strategies/refresh-token.strategy';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { jwtConfig } from '../../config/jwt.config';
import { PassportModule } from '@nestjs/passport';

// описываем тестовый набор для RefreshTokenGuard
describe('RefreshTokenGuard', () => {
  let guard: RefreshTokenGuard;
  let jwtService: JwtService;
  const testRefreshSecret = 'test-refresh-secret'; // тестовый секрет для refresh токенов

  // настройка тестового модуля перед всеми тестами
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        // настройка ConfigModule с загрузкой конфигурации JWT
        ConfigModule.forRoot({
          load: [jwtConfig],
        }),
        PassportModule.register({ defaultStrategy: 'jwt-refresh' }), // регистрация PassportModule с refresh стратегией
        // настройка JwtModule с тестовым секретом для refresh токенов
        JwtModule.register({
          secret: testRefreshSecret,
          signOptions: { expiresIn: '7d' }, // долгий срок жизни для refresh токена
        }),
      ],
      providers: [
        RefreshTokenGuard, // тестируемый guard
        RefreshTokenStrategy, // стратегия для refresh токенов
        {
          // Мок конфигурации JWT с тестовыми значениями
          provide: jwtConfig.KEY,
          useValue: {
            refreshSecret: testRefreshSecret, // используем тот же секрет
            refreshExpiration: '7d', // соответствует настройкам JwtModule
          },
        },
      ],
    }).compile();

    // получаем экземпляры сервисов из модуля
    guard = module.get<RefreshTokenGuard>(RefreshTokenGuard);
    jwtService = module.get<JwtService>(JwtService);
  });

  // базовый тест - проверяем что guard определен
  it('должен быть определен', () => {
    expect(guard).toBeDefined();
  });

  // вспомогательная функция для создания мока ExecutionContext
  const createMockContext = (headers: Record<string, any>) => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          headers, // Мок запроса с переданными заголовками
          cookies: {}, // Мок cookies (может потребоваться для refresh токенов)
          body: {}, // Мок тела запроса
        }),
        getResponse: () => ({}), // Мок пустого ответа
      }),
    } as ExecutionContext;
  };

  // тестируем метод canActivate
  describe('canActivate', () => {
    // Тест: должен пропустить запрос с валидным refresh токеном
    it('должен пропустить запрос с валидным refresh токеном', async () => {
      // генерируем валидный refresh токен с дополнительным полем refreshToken
      const token = jwtService.sign({
        sub: '123',
        email: 'test@test.com',
        refreshToken: 'valid-refresh-token',
      });

      // создаем Мок контекста с заголовком Authorization
      const mockContext = createMockContext({
        authorization: `Bearer ${token}`,
      });

      // вызываем canActivate и проверяем что возвращает true
      const result = await guard.canActivate(mockContext);
      expect(result).toBe(true);
    });

    // Тест: должен выбросить ошибку, если refresh токен не передан
    it('должен выбросить ошибку, если refresh токен не передан', async () => {
      const mockContext = createMockContext({}); // пустые заголовки

      // ожидаем что guard выбросит UnauthorizedException
      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    // Тест: должен выбросить ошибку, если токен без Bearer
    it('должен выбросить ошибку, если refresh токен не содержит Bearer', async () => {
      const mockContext = createMockContext({
        authorization: 'InvalidRefreshToken', // токен без префикса Bearer
      });

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    // Тест: должен выбросить ошибку для невалидного refresh токена
    it('должен выбросить ошибку, если refresh токен невалидный', async () => {
      const mockContext = createMockContext({
        authorization: 'Bearer invalid.refresh.token', // неправильный формат токена
      });

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    // Тест: должен выбросить ошибку для просроченного refresh токена
    it('должен выбросить ошибку, если refresh токен просрочен', async () => {
      // генерируем просроченный refresh токен
      const expiredToken = jwt.sign(
        {
          sub: '123',
          email: 'test@test.com',
          refreshToken: 'expired-refresh-token',
        },
        testRefreshSecret,
        { expiresIn: '-1s' }, // токен с истекшим сроком
      );

      const mockContext = createMockContext({
        authorization: `Bearer ${expiredToken}`,
      });

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    // дополнительный тест для проверки доступа к request объекту
    // (важно для refresh токенов, так как стратегия использует passReqToCallback)
    it('должен иметь доступ к request объекту', async () => {
      const token = jwtService.sign({
        sub: '123',
        email: 'test@test.com',
        refreshToken: 'valid-refresh-token',
      });

      // создаем расширенный мок request объекта
      const mockRequest = {
        headers: {
          authorization: `Bearer ${token}`,
        },
        body: {
          refreshToken: 'valid-refresh-token',
        },
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
          getResponse: () => ({}),
        }),
      } as ExecutionContext;

      const result = await guard.canActivate(mockContext);
      expect(result).toBe(true);
    });
  });
});
