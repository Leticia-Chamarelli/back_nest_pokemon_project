import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PokeapiService } from './pokeapi.service';
import { PokeapiController } from './pokeapi.controller';

@Module({
  imports: [HttpModule],
  controllers: [PokeapiController],
  providers: [PokeapiService],
  exports: [PokeapiService],
})
export class PokeapiModule {}
