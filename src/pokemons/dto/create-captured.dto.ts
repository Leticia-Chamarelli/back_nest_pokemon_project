import { IsInt, IsNotEmpty, IsOptional, IsString, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCapturedDto {
  @ApiProperty({
    description: 'ID of the captured Pokémon',
    example: 25,
  })
  @IsInt()
  pokemonId: number;

  @ApiProperty({
    description: 'Region where the Pokémon was captured',
    example: 'Kanto',
  })
  @IsString()
  @IsNotEmpty()
  region: string;

  @ApiPropertyOptional({
    description: 'Level of the captured Pokémon',
    example: 10,
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
}
