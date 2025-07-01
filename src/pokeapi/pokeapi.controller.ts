import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { PokeapiService } from './pokeapi.service';
import { PokemonQueryDto } from './dto/pokemon-query.dto';

@ApiTags('Pokémons')
@Controller('pokemons')
export class PokeapiController {
  constructor(private readonly pokeapiService: PokeapiService) {}

  @Get()
  @ApiOperation({ summary: 'List all Pokémons from PokéAPI' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 0 })
  @ApiResponse({
    status: 200,
    description: 'List of Pokémons',
  })
  async findAll(@Query() query: PokemonQueryDto) {
    const limit = query.limit ? parseInt(query.limit, 10) : 20;
    const offset = query.offset ? parseInt(query.offset, 10) : 0;
    return this.pokeapiService.getAllPokemons(limit, offset);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get detailed info of a Pokémon by name or ID' })
  @ApiResponse({ status: 200, description: 'Detailed Pokémon data' })
  @ApiResponse({ status: 404, description: 'Pokémon not found' })
  async findOne(@Param('id') id: string | number) {
    return this.pokeapiService.getPokemonDetails(Number(id));
  }
}
