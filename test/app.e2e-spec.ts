import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { JwtService } from '@nestjs/jwt';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let server: any;
  let accessToken: string;
  let refreshToken: string;
  let jwtService: JwtService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    server = app.getHttpServer();

    jwtService = app.get(JwtService);
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

    accessToken = response.body.access_token;
    refreshToken = response.body.refresh_token;
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
      .get('/auth/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.user).toHaveProperty('username', 'testuser2');
  });

  it('should fail to access protected route without token', async () => {
    const response = await request(server)
      .get('/auth/profile')
      .expect(401);

    expect(response.body).toHaveProperty('message');
  });

  it('should refresh token with valid refresh_token', async () => {
    const refreshResponse = await request(server)
      .post('/auth/refresh')
      .send({ refresh_token: refreshToken })
      .expect(201);

    expect(refreshResponse.body).toHaveProperty('access_token');
    expect(refreshResponse.body).toHaveProperty('refresh_token');

    accessToken = refreshResponse.body.access_token;
    refreshToken = refreshResponse.body.refresh_token;
  });

  it('should logout and invalidate the refresh token', async () => {
    await request(server)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(201);

    const refreshAttempt = await request(server)
      .post('/auth/refresh')
      .send({ refresh_token: refreshToken })
      .expect(401);

    expect(refreshAttempt.body).toHaveProperty('message');
  });

  it('should fail to logout without being authenticated', async () => {
    const response = await request(server)
      .post('/auth/logout')
      .expect(401);

    expect(response.body).toHaveProperty('message');
  });

  it('should not allow reuse of an invalidated refresh token', async () => {
    const loginResponse = await request(server)
      .post('/auth/login')
      .send({ username: 'testuser2', password: '123456' })
      .expect(201);

    const refreshToken = loginResponse.body.refresh_token;

    await request(server)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${loginResponse.body.access_token}`)
      .expect(201);

    const refreshResponse = await request(server)
      .post('/auth/refresh')
      .send({ refresh_token: refreshToken })
      .expect(401);

    expect(refreshResponse.body).toHaveProperty('message');
  });

  it('should fail to access protected route with expired access token', async () => {
    const payload = { username: 'testuser2', sub: 2 };

    const shortLivedToken = jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '1s',
    });

    await new Promise((res) => setTimeout(res, 2000));

    const response = await request(server)
      .get('/auth/profile')
      .set('Authorization', `Bearer ${shortLivedToken}`);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message');
  });
});
