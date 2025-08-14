import { Test, TestingModule } from '@nestjs/testing';
// import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import * as path from 'path';
import * as fs from 'fs';
import { MulterExceptionFilter } from '../src/upload/utils/multer-exception.filter';
import { NestExpressApplication } from '@nestjs/platform-express';

interface SuccessResponseBody {
  message: string;
  filePath: string;
}

describe('UploadController (e2e)', () => {
  // let app: INestApplication;
  let app: NestExpressApplication;

  const fixturesDir = path.join(process.cwd(), 'test', 'fixtures');
  const imagePath = path.join(fixturesDir, 'test-image.jpg');
  const textFilePath = path.join(fixturesDir, 'test-file.txt');

  // Минималистичный 1×1 JPEG красного цвета
  const tinyRedJpegBase64 =
    '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAoHBwgHBgoICAkHCg0KCgkKDR0NDh0eGB0VFhUdHyIfICQiJjYlKCUoKjQxNTU1GiQ7QDs0Py40NTEBDAwMEA8QHxISHzQsJCo0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NP/AABEIAKgBLAMBIgACEQEDEQH/xAAbAAEAAgMBAQAAAAAAAAAAAAAABAUCAwYBB//EAD0QAAEDAgQDBgQEBQMDBQAAAAEAAhEDIQQSMUEFUWEGEyJxgZEHFDKhsdHwFCNSYuEjM1KC8SMzY6LxQ3OD/8QAGQEAAwEBAQAAAAAAAAAAAAAAAAECAwQF/8QALhEAAgIBAwMCBgEFAAAAAAAAAAECEQMhEjMBBBUhEyJxgZGh8BQywdHh8f/aAAwDAQACEQMRAD8A8VREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREH/9k=';

  beforeAll(async () => {
    if (!fs.existsSync(fixturesDir)) {
      fs.mkdirSync(fixturesDir, { recursive: true });
    }
    fs.writeFileSync(imagePath, Buffer.from(tinyRedJpegBase64, 'base64'));
    fs.writeFileSync(textFilePath, 'Это текстовый файл');

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new MulterExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();

    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    if (fs.existsSync(textFilePath)) fs.unlinkSync(textFilePath);
  });

  it('POST /files - должен загружать валидное изображение', async () => {
    expect(fs.existsSync(imagePath)).toBe(true);

    const response = await request(app.getHttpServer())
      .post('/files')
      .attach('file', imagePath)
      .expect(201);

    const body = response.body as SuccessResponseBody;

    expect(typeof body.message).toBe('string');
    expect(body).toHaveProperty('filePath');
    expect(typeof body.filePath).toBe('string');
  });

  it('POST /files - должен отклонять файлы, не являющиеся изображениями', async () => {
    const response = await request(app.getHttpServer())
      .post('/files')
      .attach('file', textFilePath)
      .expect(400);

    const body = response.body as SuccessResponseBody;

    expect(body).toHaveProperty('message');
    expect(body.message).toMatch(
      'Файл не загружен, или загружен не в том формате',
    );
  });

  it('POST /files - должен отклонять запрос без файла', async () => {
    const response = await request(app.getHttpServer())
      .post('/files')
      .expect(400);
    const body = response.body as SuccessResponseBody;

    expect(body).toHaveProperty('message');
    expect(body.message).toMatch(
      'Файл не загружен, или загружен не в том формате',
    );
  });

  it('POST /files - должен отклонять слишком большой файл', async () => {
    const largeFilePath = path.join(fixturesDir, 'large-file.jpg');
    const largeBuffer = Buffer.alloc(3 * 1024 * 1024, 0); // 3MB
    fs.writeFileSync(largeFilePath, largeBuffer);

    const response = await request(app.getHttpServer())
      .post('/files')
      .attach('file', largeFilePath)
      .expect(413);

    const body = response.body as SuccessResponseBody;

    expect(body).toHaveProperty('message');
    expect(body.message).toMatch('File too large');

    fs.unlinkSync(largeFilePath);
  });
});
