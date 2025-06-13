import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CapturedService } from './captured.service';
import { CreateCapturedDto } from './dto/create-captured.dto';

@Controller('captured')
export class CapturedController {
  constructor(private capturedService: CapturedService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  capture(@Body() dto: CreateCapturedDto, @Request() req) {
    const userId = req.user.id;
    return this.capturedService.capture(dto.pokemonId, userId);
  }
}
