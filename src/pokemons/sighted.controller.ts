import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { SightedService } from './sighted.service';
import { CreateSightingDto } from './dto/create-sighting.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('sightings')
export class SightedController {
  constructor(private sightedService: SightedService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  registerSighting(@Body() dto: CreateSightingDto, @Request() req) {
    const userId = req.user.id;
    return this.sightedService.registerSighting(dto.pokemonId, dto.region, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getSightings(@Request() req) {
   const userId = req.user.id;
   return this.sightedService.findAllByUser(userId);
}
}