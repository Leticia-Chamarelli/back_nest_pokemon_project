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
        username: 'testuser1',
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

    expect(response.body.user).toHaveProperty('username', 'testuser1');
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
      .send({ refreshToken: refreshToken })
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
      .send({ username: 'testuser1', password: '123456' })
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
    const payload = { username: 'testuser1', sub: 2 };

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

    it('should fail to access protected route with an invalid access token', async () => {
    const fakeToken = 'Bearer faketoken.invalid.signature';

    const response = await request(server)
      .get('/auth/profile')
      .set('Authorization', fakeToken);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message');
  });

    it('should fail to refresh with invalid or expired refresh token', async () => {
    const invalidToken = 'invalid.token.string';

    const invalidResponse = await request(server)
      .post('/auth/refresh')
      .send({ refresh_token: invalidToken });

    expect(invalidResponse.status).toBe(401);
    expect(invalidResponse.body).toHaveProperty('message');

    const payload = { username: 'testuser1', sub: 2 };
    const expiredRefreshToken = app
      .get(JwtService)
      .sign(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '1s',
      });

    await new Promise((res) => setTimeout(res, 2000));

    const expiredResponse = await request(server)
      .post('/auth/refresh')
      .send({ refresh_token: expiredRefreshToken });

    expect(expiredResponse.status).toBe(401);
    expect(expiredResponse.body).toHaveProperty('message');
  });

  it('should capture a Pokémon for the authenticated user', async () => {
  const loginResponse = await request(server)
    .post('/auth/login')
    .send({ username: 'testuser1', password: '123456' })
    .expect(201);

  const token = loginResponse.body.access_token;

  const captureResponse = await request(server)
    .post('/captured')
    .set('Authorization', `Bearer ${token}`)
    .send({ pokemonId: 25 }) 
    .expect(201);

  expect(captureResponse.body).toHaveProperty('id');
  expect(captureResponse.body).toHaveProperty('pokemonId', 25);
  expect(captureResponse.body).toHaveProperty('user');
  expect(captureResponse.body.user).toHaveProperty('id');
});

  it('/captured (GET) - should return captured pokémons for the authenticated user', async () => {
    const loginResponse = await request(server)
      .post('/auth/login')
      .send({ username: 'testuser1', password: '123456' });

    const token = loginResponse.body.access_token;

    const response = await request(server)
      .get('/captured')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    if (response.body.length > 0) {
      expect(response.body[0]).toHaveProperty('pokemonId');
      expect(response.body[0]).toHaveProperty('capturedAt');
    }
  });

    it('/sightings (POST) - should register a Pokémon sighting for the authenticated user', async () => {
    const loginResponse = await request(server)
      .post('/auth/login')
      .send({ username: 'testuser1', password: '123456' });

    const token = loginResponse.body.access_token;

    const response = await request(server)
      .post('/sightings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        pokemonId: 3, 
        region: 'Kanto'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('pokemonId', 3);
    expect(response.body).toHaveProperty('region', 'Kanto');
    expect(response.body).toHaveProperty('sightedAt');
    expect(response.body.user).toHaveProperty('id');
  });

  it('/sightings (GET) - should return the user\'s sighted Pokémon', async () => {
    const loginResponse = await request(server)
      .post('/auth/login')
      .send({ username: 'testuser1', password: '123456' });

    const token = loginResponse.body.access_token;

    const response = await request(server)
      .get('/sightings')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);

    if (response.body.length > 0) {
      const sighting = response.body[0];
      expect(sighting).toHaveProperty('id');
      expect(sighting).toHaveProperty('pokemonId');
      expect(sighting).toHaveProperty('region');
      expect(sighting).toHaveProperty('sightedAt');
      expect(sighting.user).toHaveProperty('id');
    }
  });

  describe('/pokemons (GET)', () => {
  it('should return a paginated list of pokémons', async () => {
    const response = await request(app.getHttpServer())
      .get('/pokemons?limit=10&offset=0')
      
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('results');
    expect(Array.isArray(response.body.results)).toBe(true);
    expect(response.body.results.length).toBeGreaterThan(0);
    expect(response.body.results[0]).toHaveProperty('name');
    expect(response.body.results[0]).toHaveProperty('url');
  });
});


});
