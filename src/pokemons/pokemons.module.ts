import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CapturedPokemon } from './captured-pokemon.entity';
import { SightedPokemon } from './sighted-pokemon.entity';
import { CapturedService } from './captured.service';
import { SightedService } from './sighted.service';
import { CapturedController } from './captured.controller';
import { SightedController } from './sighted.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CapturedPokemon, SightedPokemon])],
  controllers: [CapturedController, SightedController],
  providers: [CapturedService, SightedService],
  exports: [TypeOrmModule],
})
export class PokemonsModule {}
