import { IsOptional, IsNumberString } from 'class-validator';

export class PokemonQueryDto {
  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  @IsNumberString()
  offset?: string;
}
