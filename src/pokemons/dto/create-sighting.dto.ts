import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateSightingDto {
  @IsInt()
  @IsNotEmpty()
  pokemonId: number;

  @IsString()
  @IsNotEmpty()
  region: string;
}