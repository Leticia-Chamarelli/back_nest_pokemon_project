import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CapturedPokemon } from './captured-pokemon.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CapturedService {
  constructor(
    @InjectRepository(CapturedPokemon)
    private capturedRepo: Repository<CapturedPokemon>,
  ) {}

  async capture(pokemonId: number, userId: number) {
    const newCapture = this.capturedRepo.create({
      pokemonId,
      user: { id: userId },
    });

    return this.capturedRepo.save(newCapture);
  }
}
