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

describe('refreshToken', () => {
  const validRefreshToken = 'valid-refresh-token';
  const invalidRefreshToken = 'invalid-refresh-token';

  it('should return new access and refresh tokens if refresh token is valid', async () => {
    (jwtService.verify as jest.Mock).mockReturnValue({ sub: 1, username: 'testuser' });
    (usersService.findOne as jest.Mock).mockResolvedValue({
      id: 1,
      username: 'testuser',
      refreshToken: 'hashed-refresh-token',
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwtService.sign as jest.Mock)
      .mockReturnValueOnce('new-access-token')
      .mockReturnValueOnce('new-refresh-token');
    (jest.spyOn(bcrypt, 'hash') as jest.Mock).mockResolvedValue('hashed-new-refresh-token');
    (usersService.updateRefreshToken as jest.Mock).mockResolvedValue(undefined);

    const result = await service.refreshToken(validRefreshToken);

    expect(jwtService.verify).toHaveBeenCalledWith(validRefreshToken, { secret: process.env.JWT_REFRESH_SECRET });
    expect(bcrypt.compare).toHaveBeenCalledWith(validRefreshToken, 'hashed-refresh-token');
    expect(usersService.updateRefreshToken).toHaveBeenCalledWith(1, 'hashed-new-refresh-token');
    expect(result).toEqual({
      access_token: 'new-access-token',
      refresh_token: 'new-refresh-token',
    });
  });

  it('should throw UnauthorizedException if refresh token is invalid or expired', async () => {
    (jwtService.verify as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    await expect(service.refreshToken(invalidRefreshToken)).rejects.toThrow('Invalid or expired refresh token');
  });

  it('should throw UnauthorizedException if user or refresh token is not found', async () => {
    (jwtService.verify as jest.Mock).mockReturnValue({ sub: 2, username: 'nonexistent' });
    (usersService.findOne as jest.Mock).mockResolvedValue(null);

    await expect(service.refreshToken(validRefreshToken)).rejects.toThrow('Invalid or expired refresh token');
  });

  it('should throw UnauthorizedException if refresh token does not match stored hash', async () => {
    (jwtService.verify as jest.Mock).mockReturnValue({ sub: 1, username: 'testuser' });
    (usersService.findOne as jest.Mock).mockResolvedValue({
      id: 1,
      username: 'testuser',
      refreshToken: 'some-other-hash',
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(service.refreshToken(validRefreshToken)).rejects.toThrow('Invalid or expired refresh token');
  });
});

});
