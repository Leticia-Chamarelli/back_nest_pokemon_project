import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let server: any;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should login with valid credentials', async () => {
    const response = await request(server)
      .post('/auth/login')
      .send({
        username: 'testuser2',
        password: '123456',
      })
      .expect(201);

    expect(response.body).toHaveProperty('access_token');
    expect(response.body).toHaveProperty('refresh_token');

    accessToken = response.body.access_token; // salvar token para usar depois
  });

  it('should not login with invalid credentials', async () => {
    const response = await request(server)
      .post('/auth/login')
      .send({
        username: 'wronguser',
        password: 'wrongpassword',
      });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message');
  });

  it('should access protected route with valid token', async () => {
    const response = await request(server)
      .get('/auth/profile') // corrigido
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.user).toHaveProperty('username', 'testuser2'); // corrigido: `.user.username`
  });

  it('should fail to access protected route without token', async () => {
    const response = await request(server)
      .get('/auth/profile') // corrigido
      .expect(401);

    expect(response.body).toHaveProperty('message');
  });

    it('should refresh token with valid refresh_token', async () => {
    const loginResponse = await request(server)
      .post('/auth/login')
      .send({
        username: 'testuser2',
        password: '123456',
      })
      .expect(201);

    const refreshToken = loginResponse.body.refresh_token;

    const refreshResponse = await request(server)
      .post('/auth/refresh')
      .send({ refresh_token: refreshToken })
      .expect(201);

    expect(refreshResponse.body).toHaveProperty('access_token');
    expect(refreshResponse.body).toHaveProperty('refresh_token');
  });
});
