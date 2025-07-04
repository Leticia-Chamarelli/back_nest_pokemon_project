import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { SightedService } from './sighted.service';
import { CreateSightingDto } from './dto/create-sighting.dto';
import { UpdateSightingDto } from './dto/update-sighting.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequestWithUser } from '../common/interfaces/request-with-user.interface';

@ApiTags('Sightings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sightings')
export class SightedController {
  constructor(private sightedService: SightedService) {}

  @Post()
  @ApiOperation({ summary: 'Register a Pokémon sighting' })
  @ApiResponse({ status: 201, description: 'Pokémon sighting registered successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBody({ type: CreateSightingDto })
  registerSighting(@Body() dto: CreateSightingDto, @Request() req: RequestWithUser) {
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
  getSightings(@Request() req: RequestWithUser) {
    const userId = req.user.id;
    return this.sightedService.findAllByUser(userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a Pokémon sighting' })
  @ApiResponse({ status: 200, description: 'Pokémon sighting updated successfully' })
  @ApiResponse({ status: 404, description: 'Sighting not found' })
  @ApiBody({ type: UpdateSightingDto })
  updateSighting(
    @Param('id') id: string,
    @Body() dto: UpdateSightingDto,
    @Request() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return this.sightedService.updateSighting(+id, userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a Pokémon sighting' })
  @ApiResponse({ status: 200, description: 'Pokémon sighting deleted successfully' })
  @ApiResponse({ status: 404, description: 'Sighting not found' })
  deleteSighting(@Param('id') id: string, @Request() req: RequestWithUser) {
    const userId = req.user.id;
    return this.sightedService.removeSighting(+id, userId);
  }
}
