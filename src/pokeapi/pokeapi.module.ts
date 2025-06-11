import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PokeapiService } from './pokeapi.service';

@Module({
  imports: [HttpModule],
  providers: [PokeapiService],
  exports: [PokeapiService],
})
export class PokeapiModule {}
