import { ApiProperty } from '@nestjs/swagger';

export class PokemonDetailDto {
   @ApiProperty()
  id: number;

  @ApiProperty({ example: 'Pikachu' })
  name: string;

  @ApiProperty({ example: 'https://raw.githubusercontent.com/...png' })
  sprite: string;

  @ApiProperty({ example: ['Electric'] })
  types: string[];

  @ApiProperty({ example: ['Static', 'Lightning Rod'] })
  abilities: string[];

  @ApiProperty({
    example: [
      { name: 'hp', value: 35 },
      { name: 'attack', value: 55 },
    ],
  })
  stats: { name: string; value: number }[];

  @ApiProperty({ example: 112 })
  base_experience: number;

  @ApiProperty({ example: 4 })
  height: number;

  @ApiProperty({ example: 60 })
  weight: number;
}
