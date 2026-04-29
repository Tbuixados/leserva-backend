import {
  IsString,
  IsOptional,
  IsInt,
  IsNumber,
  MinLength,
  Min,
} from 'class-validator';

export class UpdateServiceDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsOptional()
  @Min(5)
  durationMinutes?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;

  @IsOptional()
  isActive?: boolean;
}
