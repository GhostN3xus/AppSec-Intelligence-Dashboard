import { IsString } from 'class-validator';

export class UpsertDocumentDto {
  @IsString()
  title: string;

  @IsString()
  slug: string;

  @IsString()
  category: string;

  @IsString()
  content: string;
}
