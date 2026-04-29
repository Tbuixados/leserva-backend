import { IsString, IsUUID, IsOptional, Matches } from 'class-validator';

export class CreateAppointmentDto {
  @IsUUID('4')
  professionalId!: string;

  @IsUUID('4')
  serviceId!: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'date debe tener formato YYYY-MM-DD (ej: 2026-05-15)',
  })
  date!: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'startTime debe tener formato HH:mm (ej: 09:00)',
  })
  startTime!: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
