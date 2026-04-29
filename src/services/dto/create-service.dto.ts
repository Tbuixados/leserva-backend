import {
  IsString,
  IsOptional,
  IsInt,
  IsNumber,
  MinLength,
  Min,
} from 'class-validator';

export class CreateServiceDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(5)
  durationMinutes!: number;

  @IsNumber()
  @Min(0)
  price!: number;
}
