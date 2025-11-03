import { IsEnum, IsOptional, IsString } from 'class-validator';
import { UserRole } from '@prisma/client';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
