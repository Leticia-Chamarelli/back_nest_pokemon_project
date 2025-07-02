import { IsOptional, IsString, IsInt, Min, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSightingDto {
  @ApiPropertyOptional({
    description: 'Level of the Pokémon',
    example: 15,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  level?: number;

  @ApiPropertyOptional({
    description: 'Nickname of the Pokémon',
    example: 'Sparky',
    maxLength: 30,
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  nickname?: string;

  @ApiPropertyOptional({
    description: 'Region where the Pokémon was sighted',
    example: 'Johto',
  })
  @IsOptional()
  @IsString()
  region?: string;
}
