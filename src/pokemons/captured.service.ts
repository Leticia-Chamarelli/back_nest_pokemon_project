import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CapturedPokemon } from './captured-pokemon.entity';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { PokeapiService } from '../pokeapi/pokeapi.service';
import { UpdateCapturedDto } from './dto/update-captured.dto';

@Injectable()
export class CapturedService {
  constructor(
    @InjectRepository(CapturedPokemon)
    private capturedRepo: Repository<CapturedPokemon>,
    private readonly pokeapiService: PokeapiService,
  ) {}

  async capture(
    pokemonId: number,
    region: string,
    user: User,
    level?: number,
    nickname?: string,
  ) {
    const regionImageMap = {
      Kanto: '/images/regions/kanto.png',
      Johto: '/images/regions/johto.png',
      Hoenn: '/images/regions/hoenn.png',
      Sinnoh: '/images/regions/sinnoh.png',
      Unova: '/images/regions/unova.png',
      Kalos: '/images/regions/kalos.png',
      Alola: '/images/regions/alola.png',
      Galar: '/images/regions/galar.png',
    };

    const newCapture = this.capturedRepo.create({
      pokemonId,
      region,
      regionImage: regionImageMap[region] || '/images/regions/default.png',
      user,
      level,
      nickname,
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

  async updateCaptured(id: number, user: User, updateDto: UpdateCapturedDto) {
    const capture = await this.capturedRepo.findOne({
      where: { id, user: { id: user.id } },
    });

    if (!capture) {
      throw new NotFoundException(`Captured Pokémon with id ${id} not found.`);
    }

    if (updateDto.level !== undefined) capture.level = updateDto.level;
    if (updateDto.nickname !== undefined) capture.nickname = updateDto.nickname;

    if (updateDto.region !== undefined) {
      capture.region = updateDto.region;

      const regionImageMap = {
        Kanto: '/images/regions/kanto.png',
        Johto: '/images/regions/johto.png',
        Hoenn: '/images/regions/hoenn.png',
        Sinnoh: '/images/regions/sinnoh.png',
        Unova: '/images/regions/unova.png',
        Kalos: '/images/regions/kalos.png',
        Alola: '/images/regions/alola.png',
        Galar: '/images/regions/galar.png',
      };

      capture.regionImage = regionImageMap[updateDto.region] || '/images/regions/default.png';
    }

    return this.capturedRepo.save(capture);
  }

  async removeCaptured(id: number, user: User) {
    const capture = await this.capturedRepo.findOne({
      where: { id, user: { id: user.id } },
    });

    if (!capture) {
      throw new NotFoundException(`Captured Pokémon with id ${id} not found.`);
    }

    await this.capturedRepo.remove(capture);
    return { message: `Captured Pokémon with id ${id} removed successfully.` };
  }
}
