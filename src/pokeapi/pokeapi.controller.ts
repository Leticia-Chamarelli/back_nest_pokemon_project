import { Controller, Get, Param, Query } from '@nestjs/common';
import { PokeapiService } from './pokeapi.service';
import { PokemonQueryDto } from './dto/pokemon-query.dto';

@Controller('pokemons')
export class PokeapiController {
  constructor(private readonly pokeapiService: PokeapiService) {}

  @Get()
  async findAll(@Query() query: PokemonQueryDto) {
    const limit = query.limit ? parseInt(query.limit, 10) : 20;
    const offset = query.offset ? parseInt(query.offset, 10) : 0;
    return this.pokeapiService.getAllPokemons(limit, offset);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.pokeapiService.getPokemonByIdOrName(id);
  }
}
