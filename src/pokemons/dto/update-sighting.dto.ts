import { IsOptional, IsString, IsInt, Min, MaxLength } from 'class-validator';

export class UpdateSightingDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  level?: number;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  nickname?: string;

  @IsOptional()
  @IsString()
  region?: string;
}
