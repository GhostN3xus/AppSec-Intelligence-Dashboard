import { IsOptional, IsString } from 'class-validator';

export class CreateApplicationDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  stack?: string;

  @IsOptional()
  @IsString()
  repository?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  ownerId?: string;

  @IsOptional()
  @IsString()
  responsibleId?: string;
}
