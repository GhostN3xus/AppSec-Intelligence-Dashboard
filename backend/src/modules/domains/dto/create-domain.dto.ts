import { DomainStatus, DomainType } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateDomainDto {
  @IsString()
  name: string;

  @IsEnum(DomainType)
  type: DomainType;

  @IsString()
  value: string;

  @IsOptional()
  @IsEnum(DomainStatus)
  status?: DomainStatus;

  @IsOptional()
  @IsString()
  environment?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  applicationId?: string;

  @IsOptional()
  @IsString()
  responsibleId?: string;
}
