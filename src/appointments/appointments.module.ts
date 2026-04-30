import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { Appointment } from './entities/appointment.entity';
import { Professional } from '../professionals/entities/professional.entity';
import { Service } from '../services/entities/service.entity';
import { Schedule } from '../schedules/entities/schedule.entity';
import { Business } from '../businesses/entities/business.entity';
import { BusinessesModule } from '../businesses/businesses.module';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Appointment,
      Professional,
      Service,
      Schedule,
      Business,
    ]),
    BusinessesModule,
    NotificationsModule,
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
