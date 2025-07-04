import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SightedPokemon } from './sighted-pokemon.entity';
import { PokeapiService } from '../pokeapi/pokeapi.service';
import { UpdateSightingDto } from './dto/update-sighting.dto';

@Injectable()
export class SightedService {
  constructor(
    @InjectRepository(SightedPokemon)
    private sightedRepo: Repository<SightedPokemon>,
    private readonly pokeapiService: PokeapiService,
  ) {}

  async registerSighting(
    pokemonId: number,
    region: string,
    userId: number,
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
      Hisui: '/images/regions/hisui.png',
      Paldea: '/images/regions/paldea.png',
    };

    const newSighting = this.sightedRepo.create({
      pokemonId,
      region,
      regionImage: regionImageMap[region] || '/images/regions/default.png',
      user: { id: userId },
      level,
      nickname,
    });

    return this.sightedRepo.save(newSighting);
  }

  async findAllByUser(userId: number) {
    return this.sightedRepo.find({
      where: { user: { id: userId } },
      relations: ['user'],
      order: { sightedAt: 'DESC' },
    });
  }

  async findOneByIdAndUser(id: number, userId: number) {
    const sighting = await this.sightedRepo.findOne({
      where: { id, user: { id: userId } },
    });

    if (!sighting) {
      throw new NotFoundException(`Sighted Pokémon with id ${id} not found.`);
    }

    const pokemonDetails = await this.pokeapiService.getPokemonByIdOrName(sighting.pokemonId);

    return {
      ...sighting,
      pokemonDetails,
      regionImage: sighting.regionImage,
    };
  }

  async updateSighting(id: number, userId: number, updateDto: UpdateSightingDto) {
    const sighting = await this.sightedRepo.findOne({
      where: { id, user: { id: userId } },
    });

    if (!sighting) {
      throw new ForbiddenException('Access to this sighting is forbidden');
    }

    if (updateDto.level !== undefined) sighting.level = updateDto.level;
    if (updateDto.nickname !== undefined) sighting.nickname = updateDto.nickname;

    if (updateDto.region !== undefined) {
      sighting.region = updateDto.region;

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

      sighting.regionImage = regionImageMap[updateDto.region] || '/images/regions/default.png';
    }

    return this.sightedRepo.save(sighting);
  }

  async removeSighting(id: number, userId: number) {
    const sighting = await this.sightedRepo.findOne({
      where: { id, user: { id: userId } },
    });

    if (!sighting) {
      throw new NotFoundException(`Sighted Pokémon with id ${id} not found.`);
    }

    await this.sightedRepo.remove(sighting);
    return { message: `Sighted Pokémon with id ${id} removed successfully.` };
  }
}
