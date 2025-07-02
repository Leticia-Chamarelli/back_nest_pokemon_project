import { IsOptional, IsString, IsInt, Min, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCapturedDto {
  @ApiPropertyOptional({
    description: 'The level of the captured Pokémon',
    example: 15,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  level?: number;

  @ApiPropertyOptional({
    description: 'Nickname given to the captured Pokémon',
    example: 'Sparky',
    maxLength: 30,
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  nickname?: string;

  @ApiPropertyOptional({
    description: 'Region where the Pokémon was captured',
    example: 'Kanto',
  })
  @IsOptional()
  @IsString()
  region?: string;
}
