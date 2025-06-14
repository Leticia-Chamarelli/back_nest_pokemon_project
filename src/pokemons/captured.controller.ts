import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CapturedService } from './captured.service';
import { CreateCapturedDto } from './dto/create-captured.dto';
import { User } from 'src/users/user.entity';

@Controller('captured')
@UseGuards(JwtAuthGuard)
export class CapturedController {
  constructor(private capturedService: CapturedService) {}

  @Post()
  capture(@Body() dto: CreateCapturedDto, @Request() req: { user: User }) {
    return this.capturedService.capture(dto.pokemonId, req.user);
  }

  @Get()
  findAll(@Request() req: { user: User }) {
    return this.capturedService.findAllByUser(req.user);
  }
}