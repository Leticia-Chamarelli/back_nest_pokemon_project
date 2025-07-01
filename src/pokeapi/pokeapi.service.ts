import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PokemonDetailDto } from 'src/pokemons/dto/pokemon-detail.dto';

@Injectable()
export class PokeapiService {
  private readonly baseUrl = 'https://pokeapi.co/api/v2';

  constructor(private readonly httpService: HttpService) {}

  async getAllPokemons(limit = 20, offset = 0) {
    const url = `${this.baseUrl}/pokemon?limit=${limit}&offset=${offset}`;
    const response = await firstValueFrom(this.httpService.get(url));
    return response.data;
  }

  async getPokemonByIdOrName(identifier: string | number) {
    const url = `${this.baseUrl}/pokemon/${identifier}`;
    try {
      const response = await firstValueFrom(this.httpService.get(url));
      return response.data;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        throw new NotFoundException(`Pokémon with id or name "${identifier}" not found.`);
      }
      throw error;
    }
  }

  async listPokemons(limit = 20, offset = 0) {
    const url = `${this.baseUrl}/pokemon?limit=${limit}&offset=${offset}`;
    const response = await firstValueFrom(this.httpService.get(url));
    return response.data;
  }

  async getPokemonDetails(pokemonId: number): Promise<PokemonDetailDto> {
    const url = `${this.baseUrl}/pokemon/${pokemonId}`;
    try {
      const response = await firstValueFrom(this.httpService.get(url));
      const data = response.data;

      const detail: PokemonDetailDto = {
        id: data.id,
        name: data.name,
        sprite: data.sprites.front_default,
        types: data.types.map((t: any) => t.type.name),
        abilities: data.abilities.map((a: any) => a.ability.name),
        stats: data.stats.map((s: any) => ({
          name: s.stat.name,
          base_stat: s.base_stat,
        })),
        base_experience: data.base_experience,
        height: data.height,
        weight: data.weight,
      };

      return detail;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        throw new NotFoundException(`Pokémon with ID ${pokemonId} not found.`);
      }
      throw error;
    }
  }
}
