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
import { ProfessionalsService } from './professionals.service';
import { CreateProfessionalDto } from './dto/create-professional.dto';
import { UpdateProfessionalDto } from './dto/update-professional.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { BusinessesService } from '../businesses/businesses.service';

@Controller('professionals')
export class ProfessionalsController {
  constructor(
    private readonly professionalsService: ProfessionalsService,
    private readonly businessesService: BusinessesService,
  ) {}

  @Get('business/:businessId')
  findByBusiness(@Param('businessId') businessId: string) {
    return this.professionalsService.findByBusiness(businessId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateProfessionalDto, @CurrentUser() user: User) {
    const business = await this.businessesService.findByUserId(user.id);
    return this.professionalsService.create(business.id, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProfessionalDto,
    @CurrentUser() user: User,
  ) {
    const business = await this.businessesService.findByUserId(user.id);
    return this.professionalsService.update(id, business.id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    const business = await this.businessesService.findByUserId(user.id);
    return this.professionalsService.remove(id, business.id);
  }
}
