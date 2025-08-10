import { Test, TestingModule } from '@nestjs/testing';
import { AccessTokenGuard } from './access-token.guard';
import { AccessTokenStrategy } from '../strategies/access-token.strategy';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { jwtConfig } from '../../config/jwt.config';
import { PassportModule } from '@nestjs/passport';

// описываем тестовый набор для AccessTokenGuard
describe('AccessTokenGuard', () => {
  let guard: AccessTokenGuard;
  let jwtService: JwtService;
  const testSecret = 'test-secret'; // секрет для тестовых токенов

  // настройка тестового модуля перед всеми тестами
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [jwtConfig], // настройка ConfigModule с загрузкой конфигурации JWT
        }),
        PassportModule.register({ defaultStrategy: 'jwt' }), // регистрация PassportModule с стратегией по умолчанию
        // настройка JwtModule с тестовым секретом
        JwtModule.register({
          secret: testSecret,
          signOptions: { expiresIn: '60s' },
        }),
      ],
      providers: [
        AccessTokenGuard, // тестируемый guard
        AccessTokenStrategy, // стратегия, которую использует guard
        {
          // Мок конфигурации JWT
          provide: jwtConfig.KEY,
          useValue: {
            accessSecret: testSecret, // используем тот же секрет, что и в JwtModule
            accessExpiration: '60s',
          },
        },
      ],
    }).compile();

    // получаем экземпляры сервисов из модуля
    guard = module.get<AccessTokenGuard>(AccessTokenGuard);
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
        }),
        getResponse: () => ({}), // Мок пустого ответа
      }),
    } as ExecutionContext;
  };

  // тестируем метод canActivate
  describe('canActivate', () => {
    // тест: должен пропустить запрос с валидным токеном
    it('должен пропустить запрос с валидным токеном', async () => {
      const token = jwtService.sign({ sub: '123', email: 'test@test.com' }); // генерируем валидный токен
      // создаем мок контекста с заголовком Authorization
      const mockContext = createMockContext({
        authorization: `Bearer ${token}`,
      });

      // вызываем canActivate и проверяем что возвращает true
      const result = await guard.canActivate(mockContext);
      expect(result).toBe(true);
    });

    // Тест: должен выбросить ошибку, если токен не передан
    it('должен выбросить ошибку, если токен не передан', async () => {
      const mockContext = createMockContext({}); // пустые заголовки

      // ожидаем что guard выбросит UnauthorizedException
      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    // Тест: должен выбросить ошибку, если токен без Bearer
    it('должен выбросить ошибку, если токен не содержит Bearer', async () => {
      const mockContext = createMockContext({
        authorization: 'InvalidToken', // токен без префикса Bearer
      });

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    // Тест: должен выбросить ошибку для невалидного токена
    it('должен выбросить ошибку, если токен невалидный', async () => {
      const mockContext = createMockContext({
        authorization: 'Bearer invalid.token.here', // неправильный формат токена
      });

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    // Тест: должен выбросить ошибку для просроченного токена
    it('должен выбросить ошибку, если токен просрочен', async () => {
      // генерируем просроченный токен
      const expiredToken = jwt.sign(
        { sub: '123', email: 'test@test.com' },
        testSecret,
        { expiresIn: '-1s' }, // токен с истекшим сроком
      );
      const mockContext = createMockContext({
        authorization: `Bearer ${expiredToken}`,
      });

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
