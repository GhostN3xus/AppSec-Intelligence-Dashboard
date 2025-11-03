import { IsNumber, IsOptional } from 'class-validator';

export class UpdateSlaConfigDto {
  @IsOptional()
  @IsNumber()
  critical?: number;

  @IsOptional()
  @IsNumber()
  high?: number;

  @IsOptional()
  @IsNumber()
  medium?: number;

  @IsOptional()
  @IsNumber()
  low?: number;
}
