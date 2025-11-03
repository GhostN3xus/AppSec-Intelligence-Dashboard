import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateResponsibleDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  department?: string;
}
