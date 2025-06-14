import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CapturedPokemon } from './captured-pokemon.entity';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';

@Injectable()
export class CapturedService {
  constructor(
    @InjectRepository(CapturedPokemon)
    private capturedRepo: Repository<CapturedPokemon>,
  ) {}

  async capture(pokemonId: number, user: User) {
    const newCapture = this.capturedRepo.create({
      pokemonId,
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
}