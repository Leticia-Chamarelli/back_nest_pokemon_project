import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

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

  describe('🛡️ Auth', () => {
    beforeEach(async () => {
      const queryRunner = dataSource.createQueryRunner();
      await queryRunner.connect();

      await queryRunner.query('SET session_replication_role = replica;');
      await queryRunner.query('TRUNCATE TABLE "captured_pokemon" CASCADE;');
      await queryRunner.query('TRUNCATE TABLE "sighted_pokemon" CASCADE;');
      await queryRunner.query('TRUNCATE TABLE "user" CASCADE;');
      await queryRunner.query('SET session_replication_role = DEFAULT;');

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

    it('POST /auth/login - should login and return tokens', async () => {
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

    it('GET /auth/profile - should return profile if token is valid', async () => {
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
      it('should fail if token is missing', () => {
        return request(app.getHttpServer())
          .post('/auth/logout')
          .expect(401)
          .expect((res) => {
            expect(res.body.message).toEqual('Unauthorized');
          });
      });

      it('should fail if token is invalid', () => {
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
          expect(typeof res.body.access_token).toBe('string');
          expect(typeof res.body.refresh_token).toBe('string');
        });
    });

    it('POST /auth/refresh - should fail with invalid refresh token', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: 'this.is.an.invalid.token' })
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

    it('GET /auth/profile - should fail without access token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toEqual('Unauthorized');
        });
    });

    it('GET /auth/profile - should fail with invalid token', () => {
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

    it('GET /captured/:id - should return details of a captured pokemon', async () => {
      const postRes = await request(app.getHttpServer())
        .post('/captured')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ pokemonId: 4, region: 'Kanto', nickname: 'Charmy' });

      const capturedId = postRes.body.id;

      return request(app.getHttpServer())
        .get(`/captured/${capturedId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .then((res) => {
          expect(res.body.id).toEqual(capturedId);
          expect(res.body.pokemonId).toEqual(4);
          expect(res.body.nickname).toEqual('Charmy');
        });
    });

    it('PUT /captured/:id - should update a captured pokemon', async () => {
      const postRes = await request(app.getHttpServer())
        .post('/captured')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ pokemonId: 7, region: 'Kanto', nickname: 'Squirt' });

      const capturedId = postRes.body.id;

      const updateDto = { region: 'Johto', nickname: 'WaterBro' };

      return request(app.getHttpServer())
        .put(`/captured/${capturedId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateDto)
        .expect(200)
        .then((res) => {
          expect(res.body.id).toEqual(capturedId);
          expect(res.body.region).toEqual(updateDto.region);
          expect(res.body.nickname).toEqual(updateDto.nickname);
        });
    });

    it('PUT /captured/:id - should fail if data is invalid', async () => {
      const postRes = await request(app.getHttpServer())
        .post('/captured')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ pokemonId: 35, region: 'Kanto', nickname: 'Cleffa' });

      const id = postRes.body.id;

      return request(app.getHttpServer())
        .put(`/captured/${id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          level: -1,
          nickname: 1234567890123456789012345678901234567890,
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('level must not be less than 1');
          expect(res.body.message).toContain('nickname must be a string');
          expect(res.body.message).toContain('nickname must be shorter than or equal to 30 characters');
        });
    });
  });

  it('GET /captured/:id - should fail if the pokemon does not belong to the user', async () => {
    const userA = { username: 'userA', password: '123456' };
    await request(app.getHttpServer()).post('/auth/register').send(userA);
    const loginA = await request(app.getHttpServer()).post('/auth/login').send(userA);
    const tokenA = loginA.body.access_token;

    const postRes = await request(app.getHttpServer())
      .post('/captured')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ pokemonId: 10, region: 'Kanto', nickname: 'Cater' });

    const capturedId = postRes.body.id;

    const userB = { username: 'userB', password: '123456' };
    await request(app.getHttpServer()).post('/auth/register').send(userB);
    const loginB = await request(app.getHttpServer()).post('/auth/login').send(userB);
    const tokenB = loginB.body.access_token;

    return request(app.getHttpServer())
      .get(`/captured/${capturedId}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(403)
      .expect((res) => {
        expect(res.body.message).toBe('Access to this Pokémon is forbidden');
      });
  });

  it('PUT /captured/:id - should fail if the captured pokemon does not belong to the user', async () => {
    const userA = { username: 'userA', password: '123456' };
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(userA);

    const loginResA = await request(app.getHttpServer())
      .post('/auth/login')
      .send(userA);

    const tokenA = loginResA.body.access_token;

    const captureRes = await request(app.getHttpServer())
      .post('/captured')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ pokemonId: 10, region: 'Kanto', nickname: 'Buddy' });

    const capturedId = captureRes.body.id;


    const userB = { username: 'userC', password: 'abcdef' };
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(userB);

    const loginResB = await request(app.getHttpServer())
      .post('/auth/login')
      .send(userB);

    const tokenB = loginResB.body.access_token;

    return request(app.getHttpServer())
      .put(`/captured/${capturedId}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ nickname: 'NotMyPokemon' })
      .expect(403)
      .expect((res) => {
        expect(res.body.message).toBe('Access to this Pokémon is forbidden');
      });
  });


  it('POST /captured - should fail if required fields are missing', async () => {
    return request(app.getHttpServer())
      .post('/captured')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({})
      .expect(400)
      .expect((res) => {
        expect(res.body.message).toContain('pokemonId must be an integer number');
        expect(res.body.message).toContain('region must be a string');
        expect(res.body.message).toContain('region should not be empty');
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

  it('POST /sightings - should fail if required fields are missing', () => {
    return request(app.getHttpServer())
      .post('/sightings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({})
      .expect(400)
      .expect((res) => {
        expect(res.body.message).toContain('pokemonId should not be empty');
        expect(res.body.message).toContain('pokemonId must be an integer number');
        expect(res.body.message).toContain('region should not be empty');
        expect(res.body.message).toContain('region must be a string');
      });
  });

  it('GET /sightings - should list all sightings for the user', async () => {
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.query('SET session_replication_role = replica;');
    await queryRunner.query('TRUNCATE TABLE "sighted_pokemon" CASCADE;');
    await queryRunner.query('SET session_replication_role = DEFAULT;');
    await queryRunner.release();

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


  it('PUT /sightings/:id - should update a pokemon sighting', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/sightings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ pokemonId: 10, region: 'Kanto' });

    const sightingId = createRes.body.id;

    return request(app.getHttpServer())
      .put(`/sightings/${sightingId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ region: 'Johto' })
      .expect(200)
      .then((res) => {
        expect(res.body.region).toBe('Johto');
        expect(res.body.id).toBe(sightingId);
      });
  });

  it('PUT /sightings/:id - should fail if the sighting does not belong to the user', async () => {
    const sighting = await request(app.getHttpServer())
      .post('/sightings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ pokemonId: 55, region: 'Kanto' });

    const sightingId = sighting.body.id;

    const userB = { username: 'misty', password: 'waterpass' };
    await request(app.getHttpServer()).post('/auth/register').send(userB);
    const loginB = await request(app.getHttpServer()).post('/auth/login').send(userB);
    const tokenB = loginB.body.access_token;

    return request(app.getHttpServer())
      .put(`/sightings/${sightingId}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ region: 'Johto' })
      .expect(403)
      .expect((res) => {
        expect(res.body.message).toBe('Access to this sighting is forbidden');
      });
  });

  it('PUT /sightings/:id - should fail if data is invalid', async () => {
    const postRes = await request(app.getHttpServer())
      .post('/sightings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ pokemonId: 150, region: 'Kanto' });

    const sightingId = postRes.body.id;

    return request(app.getHttpServer())
      .put(`/sightings/${sightingId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        level: 0,
        nickname: {},
        region: '',
      })
      .expect(400)
      .expect((res) => {
        expect(res.body.message).toContain('level must not be less than 1');
        expect(res.body.message).toContain('nickname must be a string');
      });
  });

  it('DELETE /sightings/:id - should delete a sighting', async () => {
    const postRes = await request(app.getHttpServer())
      .post('/sightings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ pokemonId: 25, region: 'Kanto' });

    const sightingId = postRes.body.id;

    await request(app.getHttpServer())
      .delete(`/sightings/${sightingId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.message).toContain(`Sighted Pokémon with id ${sightingId} removed successfully`);
      });

    await request(app.getHttpServer())
      .put(`/sightings/${sightingId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ region: 'Johto' })
      .expect(403);
  });
});