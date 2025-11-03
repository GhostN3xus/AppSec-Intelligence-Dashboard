import { IsEnum, IsOptional, IsString } from 'class-validator';

enum ReportFormat {
  pdf = 'pdf',
  docx = 'docx',
  html = 'html',
  json = 'json',
}

export class GenerateReportDto {
  @IsString()
  name: string;

  @IsString()
  templateId: string;

  @IsEnum(ReportFormat)
  format: ReportFormat;

  @IsOptional()
  payload?: Record<string, any>;
}

export type ReportFormatType = `${ReportFormat}`;
