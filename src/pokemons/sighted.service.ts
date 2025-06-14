import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SightedPokemon } from './sighted-pokemon.entity';

@Injectable()
export class SightedService {
  constructor(
    @InjectRepository(SightedPokemon)
    private sightedRepo: Repository<SightedPokemon>,
  ) {}

  async registerSighting(pokemonId: number, region: string, userId: number) {
    const newSighting = this.sightedRepo.create({
      pokemonId,
      region,
      user: { id: userId },
    });

    return this.sightedRepo.save(newSighting);
  }
}