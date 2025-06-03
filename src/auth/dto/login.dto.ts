import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'testuser',
    description: 'Username of the user for login',
  })
  @IsString()
  username: string;

  @ApiProperty({
    example: '123456',
    description: 'Password of the user for login',
  })
  @IsString()
  password: string;
}
