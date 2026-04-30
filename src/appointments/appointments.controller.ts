import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { AvailableSlotsDto } from './dto/available-slots.dto';
import { AppointmentStatus } from './entities/appointment.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { BusinessesService } from '../businesses/businesses.service';
import { IsEnum } from 'class-validator';

class UpdateStatusDto {
  @IsEnum(AppointmentStatus)
  status!: AppointmentStatus;
}

@Controller('appointments')
export class AppointmentsController {
  constructor(
    private readonly appointmentsService: AppointmentsService,
    private readonly businessesService: BusinessesService,
  ) {}

  // Consulta pública de slots disponibles
  @Get('available-slots')
  getAvailableSlots(@Query() dto: AvailableSlotsDto) {
    return this.appointmentsService.getAvailableSlots(dto);
  }

  // El cliente crea una reserva
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateAppointmentDto, @CurrentUser() user: User) {
    return this.appointmentsService.create(user, dto);
  }

  // El cliente ve sus propias reservas
  @Get('my')
  @UseGuards(JwtAuthGuard)
  getMyAppointments(@CurrentUser() user: User) {
    return this.appointmentsService.findByClient(user.id);
  }

  // El negocio ve todas las reservas que recibió
  @Get('business')
  @UseGuards(JwtAuthGuard)
  async getBusinessAppointments(@CurrentUser() user: User) {
    const business = await this.businessesService.findByUserId(user.id);
    return this.appointmentsService.findByBusiness(business.id);
  }

  // El negocio actualiza el estado de una reserva
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
    @CurrentUser() user: User,
  ) {
    const business = await this.businessesService
      .findByUserId(user.id)
      .catch(() => undefined);
    return this.appointmentsService.updateStatus(
      id,
      dto.status,
      user.id,
      business?.id,
    );
  }
}
