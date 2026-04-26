import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { BusinessesService } from './businesses.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('businesses')
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  // Crea el negocio del usuario autenticado
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateBusinessDto, @CurrentUser() user: User) {
    return this.businessesService.create(user.id, dto);
  }

  // Devuelve el negocio del usuario autenticado
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMyBusiness(@CurrentUser() user: User) {
    return this.businessesService.findByUserId(user.id);
  }

  // Ruta pública: perfil del negocio por slug
  @Get(':slug')
  getBySlug(@Param('slug') slug: string) {
    return this.businessesService.findBySlug(slug);
  }
}
