import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { User } from '../src/users/user.entity';
import { CapturedPokemon } from '../src/pokemons/captured-pokemon.entity';
import { SightedPokemon } from '../src/pokemons/sighted-pokemon.entity';

describe('App E2E Tests', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let accessToken: string;

  const testUser = {
    username: 'testuser1',
    password: '123456',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();

    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth', () => {
    beforeEach(async () => {
      const queryRunner = dataSource.createQueryRunner();
      await queryRunner.connect();

      await queryRunner.query('SET session_replication_role = replica;'); // Disable FK checks
      await queryRunner.query('TRUNCATE TABLE "captured_pokemon" CASCADE;');
      await queryRunner.query('TRUNCATE TABLE "sighted_pokemon" CASCADE;');
      await queryRunner.query('TRUNCATE TABLE "user" CASCADE;');
      await queryRunner.query('SET session_replication_role = DEFAULT;'); // Re-enable FK checks

      await queryRunner.release();
    });

    it('POST /auth/register - should register a new user successfully', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201)
        .expect((res) => {
          expect(res.body.message).toEqual('User created');
          expect(res.body.user.username).toEqual(testUser.username);
        });
    });

    it('POST /auth/register - should fail if username already exists', async () => {
      await request(app.getHttpServer()).post('/auth/register').send(testUser);
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(409);
    });

    it('POST /auth/login - should login a registered user and return tokens', async () => {
      await request(app.getHttpServer()).post('/auth/register').send(testUser);

      return request(app.getHttpServer())
        .post('/auth/login')
        .send(testUser)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body.user.username).toEqual(testUser.username);
        });
    });

    it('GET /auth/profile - should return the user profile if token is valid', async () => {
      await request(app.getHttpServer()).post('/auth/register').send(testUser);
      const loginRes = await request(app.getHttpServer()).post('/auth/login').send(testUser);
      const token = loginRes.body.access_token;

      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.user.username).toEqual(testUser.username);
        });
    });


    it('POST /auth/login - should login a registered user and return tokens', async () => {
      await request(app.getHttpServer()).post('/auth/register').send(testUser);

      return request(app.getHttpServer())
        .post('/auth/login')
        .send(testUser)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body.user.username).toEqual(testUser.username);
        });
    });

    it('GET /auth/profile - should return the user profile if token is valid', async () => {
      await request(app.getHttpServer()).post('/auth/register').send(testUser);
      const loginRes = await request(app.getHttpServer()).post('/auth/login').send(testUser);
      const token = loginRes.body.access_token;

      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.user.username).toEqual(testUser.username);
        });
    });

    it('POST /auth/logout - should logout and invalidate the refresh token', async () => {
      await request(app.getHttpServer()).post('/auth/register').send(testUser);
      const loginRes = await request(app.getHttpServer()).post('/auth/login').send(testUser);
      const token = loginRes.body.access_token;

      return request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toEqual('Logout successful');
        });
    });

        describe('POST /auth/logout - missing or invalid token', () => {
      it('should fail if token is missing', async () => {
        return request(app.getHttpServer())
          .post('/auth/logout')
          .expect(401)
          .expect((res) => {
            expect(res.body.message).toEqual('Unauthorized');
          });
      });

      it('should fail if token is invalid', async () => {
        return request(app.getHttpServer())
          .post('/auth/logout')
          .set('Authorization', 'Bearer invalidtoken123')
          .expect(401)
          .expect((res) => {
            expect(res.body.message).toEqual('Unauthorized');
          });
      });
    });

    it('POST /auth/refresh - should generate new tokens with valid refresh token', async () => {
  await request(app.getHttpServer()).post('/auth/register').send(testUser);
  const loginRes = await request(app.getHttpServer()).post('/auth/login').send(testUser);
  
  const refreshToken = loginRes.body.refresh_token;
  
  return request(app.getHttpServer())
    .post('/auth/refresh')
    .send({ refreshToken })
    .expect(200)
    .expect((res) => {
      expect(res.body).toHaveProperty('access_token');
      expect(res.body).toHaveProperty('refresh_token');
      expect(typeof res.body.access_token).toBe('string');
      expect(typeof res.body.refresh_token).toBe('string');
    });
});

it('POST /auth/refresh - should fail with invalid refresh token', async () => {
  const invalidRefreshToken = 'this.is.an.invalid.token';

  return request(app.getHttpServer())
    .post('/auth/refresh')
    .send({ refreshToken: invalidRefreshToken })
    .expect(401)
    .expect((res) => {
      expect(res.body.message).toEqual('Invalid or expired refresh token');
    });
});

it('POST /auth/login - should fail with invalid credentials', async () => {
  await request(app.getHttpServer()).post('/auth/register').send(testUser);

  return request(app.getHttpServer())
    .post('/auth/login')
    .send({ username: testUser.username, password: 'wrongpassword' })
    .expect(401)
    .expect((res) => {
      expect(res.body.message).toEqual('Invalid credentials');
    });
});

it('GET /auth/profile - should fail without access token', async () => {
  return request(app.getHttpServer())
    .get('/auth/profile')
    .expect(401)
    .expect((res) => {
      expect(res.body.message).toEqual('Unauthorized');
    });
});

it('GET /auth/profile - should fail with invalid token', async () => {
  return request(app.getHttpServer())
    .get('/auth/profile')
    .set('Authorization', 'Bearer invalid.token.here')
    .expect(401)
    .expect((res) => {
      expect(res.body.message).toEqual('Unauthorized');
    });
});

  });

  describe('Pokemon (Captured & Sighted)', () => {
    beforeEach(async () => {
      const queryRunner = dataSource.createQueryRunner();
      await queryRunner.connect();

      await queryRunner.query('SET session_replication_role = replica;');
      await queryRunner.query('TRUNCATE TABLE "captured_pokemon" CASCADE;');
      await queryRunner.query('TRUNCATE TABLE "sighted_pokemon" CASCADE;');
      await queryRunner.query('TRUNCATE TABLE "user" CASCADE;');
      await queryRunner.query('SET session_replication_role = DEFAULT;');

      await queryRunner.release();

      await request(app.getHttpServer()).post('/auth/register').send(testUser);
      const loginResponse = await request(app.getHttpServer()).post('/auth/login').send(testUser);
      accessToken = loginResponse.body.access_token;
    });

    it('POST /captured - should capture a pokemon for the logged-in user', () => {
      const captureDto = { pokemonId: 25, region: 'Kanto', nickname: 'Sparky' };
      return request(app.getHttpServer())
        .post('/captured')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(captureDto)
        .expect(201)
        .then((res) => {
          expect(res.body.pokemonId).toEqual(captureDto.pokemonId);
          expect(res.body.nickname).toEqual(captureDto.nickname);
        });
    });

    it('GET /captured - should list captured pokemons for the logged-in user', async () => {
      await request(app.getHttpServer())
        .post('/captured')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ pokemonId: 1, region: 'Kanto' });

      return request(app.getHttpServer())
        .get('/captured')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .then((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBe(1);
          expect(res.body[0].pokemonId).toEqual(1);
        });
    });

    it('DELETE /captured/:id - should release a captured pokemon', async () => {
      const postRes = await request(app.getHttpServer())
        .post('/captured')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ pokemonId: 149, region: 'Kanto', nickname: 'Dragon' });

      const capturedId = postRes.body.id;

      return request(app.getHttpServer())
        .delete(`/captured/${capturedId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('POST /sightings - should register a pokemon sighting', () => {
      const sightingDto = { pokemonId: 147, region: 'Johto' };
      return request(app.getHttpServer())
        .post('/sightings')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(sightingDto)
        .expect(201)
        .then((res) => {
          expect(res.body.pokemonId).toEqual(sightingDto.pokemonId);
        });
    });

    it('GET /sightings - should list all sightings for the user', async () => {
      await request(app.getHttpServer())
        .post('/sightings')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ pokemonId: 132, region: 'Kanto' });

      return request(app.getHttpServer())
        .get('/sightings')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .then((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBe(1);
          expect(res.body[0].pokemonId).toEqual(132);
        });
    });
  });
});
