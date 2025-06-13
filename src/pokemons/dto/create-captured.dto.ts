import { IsInt } from 'class-validator';

export class CreateCapturedDto {
  @IsInt()
  pokemonId: number;
}
