import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { BusinessesService } from '../businesses/businesses.service';

@Controller('services')
export class ServicesController {
  constructor(
    private readonly servicesService: ServicesService,
    private readonly businessesService: BusinessesService,
  ) {}

  // Ruta pública: clientes ven los servicios de un negocio
  @Get('business/:businessId')
  findByBusiness(@Param('businessId') businessId: string) {
    return this.servicesService.findByBusiness(businessId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateServiceDto, @CurrentUser() user: User) {
    const business = await this.businessesService.findByUserId(user.id);
    return this.servicesService.create(business.id, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateServiceDto,
    @CurrentUser() user: User,
  ) {
    const business = await this.businessesService.findByUserId(user.id);
    return this.servicesService.update(id, business.id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    const business = await this.businessesService.findByUserId(user.id);
    return this.servicesService.remove(id, business.id);
  }
}
