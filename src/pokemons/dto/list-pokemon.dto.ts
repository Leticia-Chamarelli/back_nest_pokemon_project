import { IsOptional, IsNumberString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListPokemonDto {
  @ApiPropertyOptional({
    description: 'Limit the number of Pokémons returned',
    example: '20',
  })
  @IsOptional()
  @IsNumberString()
  limit?: string;

  @ApiPropertyOptional({
    description: 'Offset for pagination',
    example: '0',
  })
  @IsOptional()
  @IsNumberString()
  offset?: string;
}
