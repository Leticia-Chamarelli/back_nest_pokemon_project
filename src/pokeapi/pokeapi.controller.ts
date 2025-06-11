import { Controller, Get, Param, Query } from '@nestjs/common';
import { PokeapiService } from './pokeapi.service';
import { PokemonQueryDto } from './dto/pokemon-query.dto';

@Controller('pokemons')
export class PokeapiController {
  constructor(private readonly pokeapiService: PokeapiService) {}

  @Get()
  getAll(@Query() query: PokemonQueryDto) {
    const { limit, offset } = query;
    return this.pokeapiService.getAllPokemons(
      Number(limit) || 20,
      Number(offset) || 0,
    );
  }

  @Get(':id')
  getByIdOrName(@Param('id') id: string) {
    return this.pokeapiService.getPokemonByIdOrName(id);
  }
}
