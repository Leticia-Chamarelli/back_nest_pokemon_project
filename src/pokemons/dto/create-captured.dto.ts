import { IsInt, IsNotEmpty, IsOptional, IsString, Min, MaxLength } from 'class-validator';

export class CreateCapturedDto {
  @IsInt()
  pokemonId: number;

  @IsString()
  @IsNotEmpty()
  region: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  level?: number;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  nickname?: string;
}
