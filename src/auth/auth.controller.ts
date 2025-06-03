import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  UseGuards,
  Get,
  Req,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RequestWithUser } from '../common/interfaces/request-with-user.interface';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh.dto';
import {
  ApiTags,
  ApiBody,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string', example: 'newuser' },
        password: { type: 'string', example: 'password123' },
      },
      required: ['username', 'password'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    schema: {
      example: {
        message: 'User created',
        user: { id: 1, username: 'newuser' },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Username already exists',
    schema: {
      example: {
        statusCode: 409,
        message: 'Username already exists',
        error: 'Conflict',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Missing fields',
  })
  async register(
    @Body('username') username: string,
    @Body('password') password: string,
  ) {
    const existing = await this.usersService.findByUsername(username);
    if (existing) {
      throw new ConflictException('Username already exists');
    }
    const user = await this.usersService.create(username, password);
    return {
      message: 'User created',
      user: { id: user.id, username: user.username },
    };
  }

  @Post('login')
  @ApiOperation({ summary: 'Login and receive tokens' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      example: {
        accessToken: 'access_token_example',
        refreshToken: 'refresh_token_example',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid credentials',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Missing fields',
  })
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.username,
      loginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: 'Access token refreshed',
    schema: {
      example: {
        accessToken: 'new_access_token_example',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired refresh token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid or expired refresh token',
        error: 'Unauthorized',
      },
    },
  })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile (protected)' })
  @ApiResponse({
    status: 200,
    description: 'User profile returned',
    schema: {
      example: {
        user: {
          id: 1,
          username: 'exampleUser',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Missing or invalid access token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
    },
  })
  getProfile(@Req() req: RequestWithUser) {
    return { user: req.user };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user (protected)' })
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
    schema: {
      example: {
        message: 'Logout successful',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Missing or invalid access token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
    },
  })
  async logout(@Req() req: RequestWithUser) {
    await this.authService.logout(req.user.id);
    return { message: 'Logout successful' };
  }
}
