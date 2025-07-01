import { Body, Controller, Get, Param, Post, Put, Delete, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CapturedService } from './captured.service';
import { CreateCapturedDto } from './dto/create-captured.dto';
import { UpdateCapturedDto } from './dto/update-captured.dto'; 
import { User } from '../users/user.entity';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Captured')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('captured')
export class CapturedController {
  constructor(private capturedService: CapturedService) {}

  @Post()
  @ApiOperation({ summary: 'Capture a Pokémon' })
  @ApiResponse({ status: 201, description: 'Pokémon captured successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  capture(@Body() dto: CreateCapturedDto, @Request() req: { user: User }) {
    return this.capturedService.capture(
      dto.pokemonId,
      dto.region,
      req.user,
      dto.level,
      dto.nickname,
    );
  }

  @Get()
  @ApiOperation({ summary: 'List all captured Pokémons by the authenticated user' })
  @ApiResponse({ status: 200, description: 'List of captured Pokémons' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Request() req: { user: User }) {
    return this.capturedService.findAllByUser(req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific captured Pokémon' })
  @ApiResponse({ status: 200, description: 'Captured Pokémon details' })
  @ApiResponse({ status: 404, description: 'Captured Pokémon not found' })
  findOne(@Param('id') id: string, @Request() req: { user: User }) {
    return this.capturedService.findOneByIdAndUser(+id, req.user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a captured Pokémon' })
  @ApiResponse({ status: 200, description: 'Pokémon updated successfully' })
  @ApiResponse({ status: 404, description: 'Captured Pokémon not found' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateCapturedDto,
    @Request() req: { user: User },
  ) {
    return this.capturedService.updateCaptured(+id, req.user, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a captured Pokémon' })
  @ApiResponse({ status: 200, description: 'Pokémon removed successfully' })
  @ApiResponse({ status: 404, description: 'Captured Pokémon not found' })
  remove(@Param('id') id: string, @Request() req: { user: User }) {
    return this.capturedService.removeCaptured(+id, req.user);
  }
}
