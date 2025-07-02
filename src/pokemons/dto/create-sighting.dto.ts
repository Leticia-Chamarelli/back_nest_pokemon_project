import { IsInt, IsNotEmpty, IsOptional, IsString, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSightingDto {
  @ApiProperty({
    description: 'ID of the sighted Pokémon',
    example: 25,
  })
  @IsInt()
  @IsNotEmpty()
  pokemonId: number;

  @ApiProperty({
    description: 'Region where the Pokémon was sighted',
    example: 'Kanto',
  })
  @IsString()
  @IsNotEmpty()
  region: string;

  @ApiPropertyOptional({
    description: 'Level of the Pokémon',
    example: 12,
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
}
