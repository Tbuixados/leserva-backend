import { IsUUID, IsString, Matches } from 'class-validator';

export class AvailableSlotsDto {
  @IsUUID('4')
  professionalId!: string;

  @IsUUID('4')
  serviceId!: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'date debe tener formato YYYY-MM-DD (ej: 2026-05-15)',
  })
  date!: string;
}
