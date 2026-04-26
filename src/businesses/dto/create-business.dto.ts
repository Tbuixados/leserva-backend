import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  MinLength,
  MaxLength,
  Max,
  Min,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ConfirmationMode } from '../entities/business.entity';

export class CreateBusinessDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(60)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'El slug solo puede tener letras minúsculas, números y guiones',
  })
  @Transform(({ value }: { value: string }) => value?.toLowerCase().trim())
  slug?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  @IsOptional()
  lat?: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  @IsOptional()
  lng?: number;

  @IsEnum(ConfirmationMode)
  @IsOptional()
  confirmationMode?: ConfirmationMode;
}
