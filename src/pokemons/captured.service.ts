import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CapturedPokemon } from './captured-pokemon.entity';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { PokeapiService } from '../pokeapi/pokeapi.service'; 

@Injectable()
export class CapturedService {
  constructor(
    @InjectRepository(CapturedPokemon)
    private capturedRepo: Repository<CapturedPokemon>,
    private readonly pokeapiService: PokeapiService, 
  ) {}

  async capture(pokemonId: number, region: string, user: User) {
    const newCapture = this.capturedRepo.create({
      pokemonId,
      region,
      user,
    });

    return this.capturedRepo.save(newCapture);
  }

  async findAllByUser(user: User): Promise<CapturedPokemon[]> {
    return this.capturedRepo.find({
      where: { user: { id: user.id } },
      relations: ['user'],
      order: { capturedAt: 'DESC' },
    });
  }

  async findOneByIdAndUser(id: number, user: User) {
    const capture = await this.capturedRepo.findOne({
      where: { id, user: { id: user.id } },
    });

    if (!capture) {
      throw new NotFoundException(`Captured Pokémon with id ${id} not found.`);
    }

    const pokemonDetails = await this.pokeapiService.getPokemonByIdOrName(capture.pokemonId);

    return {
      ...capture,
      pokemonDetails,
      regionImage: capture.regionImage, 
    };
  }
}
