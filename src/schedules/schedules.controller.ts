import { Controller, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { SetSchedulesDto } from './dto/set-schedules.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { BusinessesService } from '../businesses/businesses.service';

@Controller('schedules')
export class SchedulesController {
  constructor(
    private readonly schedulesService: SchedulesService,
    private readonly businessesService: BusinessesService,
  ) {}

  @Get('business/:businessId')
  findByBusiness(@Param('businessId') businessId: string) {
    return this.schedulesService.findByBusiness(businessId);
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  async set(@Body() dto: SetSchedulesDto, @CurrentUser() user: User) {
    const business = await this.businessesService.findByUserId(user.id);
    return this.schedulesService.set(business.id, dto);
  }
}
