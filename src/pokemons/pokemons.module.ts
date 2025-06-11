import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CapturedPokemon } from './captured-pokemon.entity';
import { SightedPokemon } from './sighted-pokemon.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CapturedPokemon, SightedPokemon])],
  exports: [TypeOrmModule],
})
export class PokemonsModule {}
