import {
  IsString,
  IsOptional,
  IsArray,
  IsUUID,
  MinLength,
} from 'class-validator';

export class UpdateProfessionalDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  name?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @IsArray()
  @IsOptional()
  @IsUUID('4', { each: true })
  serviceIds?: string[];

  @IsOptional()
  isActive?: boolean;
}
