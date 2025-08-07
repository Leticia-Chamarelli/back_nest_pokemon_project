import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
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
  try {
    const results = await this.sightedRepo.find({
      where: { user: { id: userId } },
      relations: ['user'],
      order: { sightedAt: 'DESC' },
    });

    console.log('🔵 Sightings found for user:', results);
    return results;
  } catch (error) {
    console.error('🔴 Error in findAllByUser:', error);
    throw error;
  }
}

  async findOneByIdAndUser(id: number, userId: number) {
    console.log(`🔵 Searching for sighting with ID=${id} and userID=${userId}...`);

    const sighting = await this.sightedRepo.findOne({
      where: { id, user: { id: userId } },
    });

    console.log('🟣 Result from findOne:', sighting);

    if (!sighting) {
      console.warn(`⚠️ No sighting found for ID ${id} and user ID ${userId}`);
      throw new NotFoundException(`Sighted Pokémon with ID ${id} not found.`);
    }

    console.log('🟡 Calling PokéAPI with ID:', sighting.pokemonId);

    try {
      const pokemonDetails = await this.pokeapiService.getPokemonByIdOrName(sighting.pokemonId);
      console.log('🟢 PokéAPI response:', pokemonDetails);

      return {
        ...sighting,
        pokemonDetails,
        regionImage: sighting.regionImage,
      };
    } catch (error) {
      console.error('🔴 PokéAPI error:', {
        message: error.message,
        status: error?.response?.status,
        data: error?.response?.data,
      });

      throw new InternalServerErrorException('Failed to retrieve Pokémon data from PokéAPI.');
    }
  }

  async updateSighting(id: number, userId: number, updateDto: UpdateSightingDto) {
    const sighting = await this.sightedRepo.findOne({
      where: { id, user: { id: userId } },
    });

    if (!sighting) {
      throw new ForbiddenException('You are not allowed to update this sighting.');
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
        Hisui: '/images/regions/hisui.png',
        Paldea: '/images/regions/paldea.png',
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
      throw new NotFoundException(`Sighted Pokémon with ID ${id} not found.`);
    }

    await this.sightedRepo.remove(sighting);
    return { message: `Sighted Pokémon with ID ${id} was removed successfully.` };
  }
}
