import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CapturedService } from './captured.service';
import { CreateCapturedDto } from './dto/create-captured.dto';
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
    return this.capturedService.capture(dto.pokemonId, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'List all captured Pokémons by the authenticated user' })
  @ApiResponse({ status: 200, description: 'List of captured Pokémons' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Request() req: { user: User }) {
    return this.capturedService.findAllByUser(req.user);
  }
}