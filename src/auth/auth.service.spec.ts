import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: Partial<UsersService>;
  let jwtService: Partial<JwtService>;

  const mockUser = {
    id: 1,
    username: 'testuser',
    password: 'hashedpassword',
    refreshToken: 'somehashedrefreshtoken',
  };

  beforeEach(async () => {
    usersService = {
      findByUsername: jest.fn(),
      findOne: jest.fn(),
      updateRefreshToken: jest.fn(),
    };

    jwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('validateUser', () => {
    it('should return user data without password if credentials are valid', async () => {
      (usersService.findByUsername as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('testuser', 'validpassword');
      expect(result).toEqual({ id: 1, username: 'testuser', refreshToken: 'somehashedrefreshtoken' });
    });

    it('should return null if user is not found', async () => {
      (usersService.findByUsername as jest.Mock).mockResolvedValue(null);

      const result = await service.validateUser('invaliduser', 'password');
      expect(result).toBeNull();
    });

    it('should return null if password is invalid', async () => {
      (usersService.findByUsername as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('testuser', 'wrongpassword');
      expect(result).toBeNull();
    });

    it('should return null if the user does not exist (mockResolvedValueOnce)', async () => {
      (usersService.findByUsername as jest.Mock).mockResolvedValueOnce(null);

      const result = await service.validateUser('nonexistent', 'anyPassword');
      expect(result).toBeNull();
    });

    it('should return null if the password is incorrect (mockResolvedValueOnce)', async () => {
      const tempUser = {
        id: 1,
        username: 'testuser',
        password: 'hashedPassword',
      };

      (usersService.findByUsername as jest.Mock).mockResolvedValueOnce(tempUser);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      const result = await service.validateUser('testuser', 'wrongPassword');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access and refresh tokens and update hashed refresh token', async () => {
      const mockUser = { id: 1, username: 'testuser' };

      const accessToken = 'access-token';
      const refreshToken = 'refresh-token';
      const hashedRefreshToken = 'hashed-refresh-token';

      const signSpy = jest.spyOn(jwtService, 'sign');
      signSpy
        .mockReturnValueOnce(accessToken)  
        .mockReturnValueOnce(refreshToken); 

      jest.spyOn(bcrypt, 'hash').mockImplementation(async () => hashedRefreshToken);

      const updateRefreshTokenSpy = jest
        .spyOn(usersService, 'updateRefreshToken')
        .mockResolvedValueOnce(undefined);

      const result = await service.login(mockUser);

      expect(signSpy).toHaveBeenCalledTimes(2);
      expect(bcrypt.hash).toHaveBeenCalledWith(refreshToken, 10);
      expect(updateRefreshTokenSpy).toHaveBeenCalledWith(mockUser.id, hashedRefreshToken);
      expect(result).toEqual({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    });
  });
});
