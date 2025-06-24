import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateCapturedDto {
  @IsInt()
  pokemonId: number;

  @IsString()
  @IsNotEmpty()
  region: string;
}
