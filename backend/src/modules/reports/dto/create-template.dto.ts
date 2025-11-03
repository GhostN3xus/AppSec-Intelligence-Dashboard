import { IsString } from 'class-validator';

export class CreateTemplateDto {
  @IsString()
  name: string;

  @IsString()
  category: string;

  @IsString()
  content: string;
}
