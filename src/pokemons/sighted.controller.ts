import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { SightedService } from './sighted.service';
import { CreateSightingDto } from './dto/create-sighting.dto';
import { UpdateSightingDto } from './dto/update-sighting.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Sightings')
@ApiBearerAuth()
@Controller('sightings')
export class SightedController {
  constructor(private sightedService: SightedService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Register a Pokémon sighting' })
  @ApiResponse({ status: 201, description: 'Pokémon sighting registered successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  registerSighting(@Body() dto: CreateSightingDto, @Request() req) {
    const userId = req.user.id;
    return this.sightedService.registerSighting(
      dto.pokemonId,
      dto.region,
      userId,
      dto.level,
      dto.nickname,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get all Pokémon sightings by the authenticated user' })
  @ApiResponse({ status: 200, description: 'List of sightings' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getSightings(@Request() req) {
    const userId = req.user.id;
    return this.sightedService.findAllByUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get a specific Pokémon sighting by id' })
  @ApiResponse({ status: 200, description: 'Sighting found' })
  @ApiResponse({ status: 404, description: 'Sighting not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getSightingById(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    return this.sightedService.findOneByIdAndUser(+id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiOperation({ summary: 'Update a Pokémon sighting' })
  @ApiResponse({ status: 200, description: 'Pokémon sighting updated successfully' })
  @ApiResponse({ status: 404, description: 'Sighting not found' })
  updateSighting(
    @Param('id') id: string,
    @Body() dto: UpdateSightingDto,
    @Request() req,
  ) {
    const userId = req.user.id;
    return this.sightedService.updateSighting(+id, userId, dto);
  }
}
