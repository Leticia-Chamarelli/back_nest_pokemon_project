import {
  Body,
  Controller,
  Delete,
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
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Sightings')
@ApiBearerAuth()
@Controller('sightings')
@UseGuards(JwtAuthGuard)
export class SightedController {
  constructor(private sightedService: SightedService) {}

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

  @Get()
  @ApiOperation({ summary: 'Get all Pokémon sightings by the authenticated user' })
  @ApiResponse({ status: 200, description: 'List of sightings' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getSightings(@Request() req) {
    const userId = req.user.id;
    return this.sightedService.findAllByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific Pokémon sighting' })
  @ApiResponse({ status: 200, description: 'Sighting details' })
  @ApiResponse({ status: 404, description: 'Sighting not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getSightingById(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    return this.sightedService.findOneByIdAndUser(+id, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a Pokémon sighting' })
  @ApiResponse({ status: 200, description: 'Sighting updated successfully' })
  @ApiResponse({ status: 404, description: 'Sighting not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  updateSighting(
    @Param('id') id: string,
    @Body() updateDto: UpdateSightingDto,
    @Request() req,
  ) {
    const userId = req.user.id;
    return this.sightedService.updateSighting(+id, userId, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a Pokémon sighting' })
  @ApiResponse({ status: 200, description: 'Sighting deleted successfully' })
  @ApiResponse({ status: 404, description: 'Sighting not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  deleteSighting(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    return this.sightedService.deleteSighting(+id, userId);
  }
}
