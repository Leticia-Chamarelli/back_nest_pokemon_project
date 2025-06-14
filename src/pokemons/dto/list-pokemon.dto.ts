import { IsOptional, IsNumberString } from 'class-validator';

export class ListPokemonDto {
  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  @IsNumberString()
  offset?: string;
}