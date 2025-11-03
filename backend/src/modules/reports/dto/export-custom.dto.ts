import { IsEnum, IsString } from 'class-validator';
import { ReportFormat, ReportFormatType } from './generate-report.dto';

export class ExportCustomDto {
  @IsString()
  name: string;

  @IsEnum(ReportFormat)
  format: ReportFormatType;

  @IsString()
  content: string;
}
