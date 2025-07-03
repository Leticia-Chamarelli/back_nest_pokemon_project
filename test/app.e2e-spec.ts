import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { JwtService } from '@nestjs/jwt';

describe('E2E - Pokémon Project', () => {
  let app: INestApplication;
  let server: any;
  let jwtService: JwtService;
  let accessToken: string;
  let refreshToken: string;

  let capturedId: number;
  let sightedId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    server = app.getHttpServer();
    jwtService = app.get(JwtService);

    const loginRes = await request(server)
      .post('/auth/login')
      .send({ username: 'testuser1', password: '123456' });
    accessToken = loginRes.body.access_token;
    refreshToken = loginRes.body.refresh_token;

    const capturedRes = await request(server)
      .post('/captured')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        pokemonId: 25,
        region: 'Kanto',
        level: 10,
        nickname: 'Sparky',
      });
    capturedId = capturedRes.body.id;

    const sightedRes = await request(server)
      .post('/sightings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        pokemonId: 133,
        region: 'Johto',
        level: 12,
        nickname: 'Eevee',
      });
    sightedId = sightedRes.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should login with valid credentials', async () => {
    const response = await request(server)
      .post('/auth/login')
      .send({ username: 'testuser1', password: '123456' })
      .expect(201);

    expect(response.body).toHaveProperty('access_token');
    expect(response.body).toHaveProperty('refresh_token');
    accessToken = response.body.access_token;
    refreshToken = response.body.refresh_token;
  });

  it('should not login with invalid credentials', async () => {
    const response = await request(server)
      .post('/auth/login')
      .send({ username: 'wrong', password: 'wrong' });

    expect(response.status).toBe(401);
  });

  it('should access protected route with valid token', async () => {
    const res = await request(server)
      .get('/auth/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.user).toHaveProperty('username', 'testuser1');
  });

  it('should fail to access protected route without token', async () => {
    await request(server)
      .get('/auth/profile')
      .expect(401);
  });

  it('should refresh token with valid refresh_token', async () => {
    const response = await request(server)
      .post('/auth/refresh')
      .send({ refreshToken })
      .expect(201);

    expect(response.body).toHaveProperty('access_token');
    expect(response.body).toHaveProperty('refresh_token');
    accessToken = response.body.access_token;
    refreshToken = response.body.refresh_token;
  });

  it('should logout and invalidate the refresh token', async () => {
    await request(server)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(201);

    await request(server)
      .post('/auth/refresh')
      .send({ refreshToken })
      .expect(401);
  });

  it('should fail to logout without token', async () => {
    await request(server)
      .post('/auth/logout')
      .expect(401);
  });

  it('should not allow reuse of an invalidated refresh token', async () => {
    const loginRes = await request(server)
      .post('/auth/login')
      .send({ username: 'testuser1', password: '123456' })
      .expect(201);

    const reusedRefresh = loginRes.body.refresh_token;

    await request(server)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${loginRes.body.access_token}`)
      .expect(201);

    await request(server)
      .post('/auth/refresh')
      .send({ refreshToken: reusedRefresh })
      .expect(401);
  });

  it('should fail with expired access token', async () => {
    const payload = { username: 'testuser1', sub: 2 };
    const shortToken = jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '1s',
    });

    await new Promise(res => setTimeout(res, 2000));

    const res = await request(server)
      .get('/auth/profile')
      .set('Authorization', `Bearer ${shortToken}`);

    expect(res.status).toBe(401);
  });

  it('should fail with invalid access token', async () => {
    const fake = 'Bearer faketoken.invalid.signature';
    await request(server)
      .get('/auth/profile')
      .set('Authorization', fake)
      .expect(401);
  });

  it('should fail to refresh with invalid or expired refresh token', async () => {
    const fakeToken = 'invalid.token.string';
    await request(server)
      .post('/auth/refresh')
      .send({ refreshToken: fakeToken })
      .expect(401);

    const payload = { username: 'testuser1', sub: 2 };
    const expired = jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '1s',
    });

    await new Promise((r) => setTimeout(r, 2000));

    await request(server)
      .post('/auth/refresh')
      .send({ refreshToken: expired })
      .expect(401);
  });

  it('should capture a Pokémon for authenticated user', async () => {
    const login = await request(server)
      .post('/auth/login')
      .send({ username: 'testuser1', password: '123456' })
      .expect(201);

    const token = login.body.access_token;

    const res = await request(server)
      .post('/captured')
      .set('Authorization', `Bearer ${token}`)
      .send({ pokemonId: 25, region: 'Kanto' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('pokemonId', 25);
    expect(res.body).toHaveProperty('user');
  });

  it('should list captured Pokémon for the authenticated user', async () => {
    const login = await request(server)
      .post('/auth/login')
      .send({ username: 'testuser1', password: '123456' });

    const token = login.body.access_token;

    const res = await request(server)
      .get('/captured')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should register a sighting', async () => {
    const login = await request(server)
      .post('/auth/login')
      .send({ username: 'testuser1', password: '123456' });

    const token = login.body.access_token;

    const res = await request(server)
      .post('/sightings')
      .set('Authorization', `Bearer ${token}`)
      .send({ pokemonId: 3, region: 'Kanto' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('pokemonId', 3);
  });

  it('should list sightings of the authenticated user', async () => {
    const login = await request(server)
      .post('/auth/login')
      .send({ username: 'testuser1', password: '123456' });

    const token = login.body.access_token;

    const res = await request(server)
      .get('/sightings')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should return a paginated list of pokémons', async () => {
    const res = await request(server)
      .get('/pokemons?limit=10&offset=0');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('results');
  });

  it('should return pokémon details by ID', async () => {
    const res = await request(server)
      .get('/pokemons/1');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', 1);
  });

  it('should return pokémon details by name', async () => {
    const res = await request(server)
      .get('/pokemons/pikachu');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('name', 'pikachu');
  });

  it('should return 404 for unknown pokémon', async () => {
    const res = await request(server)
      .get('/pokemons/unknownmon');

    expect(res.status).toBe(404);
  });

  it('should update a captured Pokémon', async () => {
    const updateData = {
      level: 20,
      nickname: 'SparkyUpdated',
      region: 'Johto',
    };

    const res = await request(server)
      .put(`/captured/${capturedId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(updateData)
      .expect(200);

    expect(res.body.level).toBe(updateData.level);
    expect(res.body.nickname).toBe(updateData.nickname);
    expect(res.body.region).toBe(updateData.region);
  });

  it('should delete a captured Pokémon', async () => {
    const res = await request(server)
      .delete(`/captured/${capturedId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.message).toContain('removed successfully');

    const listRes = await request(server)
      .get('/captured')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(listRes.body.find((c) => c.id === capturedId)).toBeUndefined();
  });

  it('should update a sighted Pokémon', async () => {
    const updateData = {
      level: 18,
      nickname: 'EeveeUpdated',
      region: 'Kanto',
    };

    const res = await request(server)
      .put(`/sightings/${sightedId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(updateData)
      .expect(200);

    expect(res.body.level).toBe(updateData.level);
    expect(res.body.nickname).toBe(updateData.nickname);
    expect(res.body.region).toBe(updateData.region);
  });

  it('should delete a sighted Pokémon', async () => {
    const res = await request(server)
      .delete(`/sightings/${sightedId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.message).toContain('removed successfully');

    const listRes = await request(server)
      .get('/sightings')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(listRes.body.find((s) => s.id === sightedId)).toBeUndefined();
  });
});
