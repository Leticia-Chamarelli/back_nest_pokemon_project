import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CapturedPokemon } from './captured-pokemon.entity';
import { SightedPokemon } from './sighted-pokemon.entity';
import { CapturedService } from './captured.service';
import { CapturedController } from './captured.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CapturedPokemon, SightedPokemon])],
  controllers: [CapturedController],
  providers: [CapturedService],
  exports: [TypeOrmModule],
})
export class PokemonsModule {}
