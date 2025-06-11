import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

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
    const response = await firstValueFrom(this.httpService.get(url));
    return response.data;
  }
}
