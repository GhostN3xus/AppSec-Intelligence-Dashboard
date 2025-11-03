import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { GenerateReportDto, ReportFormatType } from './dto/generate-report.dto';
import PDFDocument from 'pdfkit';
import { Document, Packer, Paragraph, TextRun } from 'docx';

function renderTemplate(content: string, payload: Record<string, any> = {}) {
  return content.replace(/{{(\w+)}}/g, (_, key) => {
    const value = payload[key];
    return value === undefined ? '' : String(value);
  });
}

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  listTemplates() {
    return this.prisma.reportTemplate.findMany();
  }

  createTemplate(data: CreateTemplateDto) {
    return this.prisma.reportTemplate.create({ data });
  }

  updateTemplate(id: string, data: UpdateTemplateDto) {
    return this.prisma.reportTemplate.update({ where: { id }, data });
  }

  deleteTemplate(id: string) {
    return this.prisma.reportTemplate.delete({ where: { id } });
  }

  async generateReport(input: GenerateReportDto) {
    const template = await this.prisma.reportTemplate.findUnique({ where: { id: input.templateId } });
    if (!template) {
      throw new NotFoundException('Template not found');
    }
    const content = renderTemplate(template.content, input.payload ?? {});
    const buffer = await this.renderBuffer(content, input.format);
    const report = await this.prisma.report.create({
      data: {
        name: input.name,
        format: input.format,
        payload: input.payload ?? {},
        templateId: template.id,
      },
    });
    return {
      id: report.id,
      fileName: `${input.name}.${input.format}`,
      mimeType: this.getMimeType(input.format),
      data: buffer,
    };
  }

  private getMimeType(format: ReportFormatType) {
    switch (format) {
      case 'pdf':
        return 'application/pdf';
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'html':
        return 'text/html';
      case 'json':
        return 'application/json';
      default:
        return 'application/octet-stream';
    }
  }

  private renderBuffer(content: string, format: ReportFormatType): Promise<Buffer> {
    if (format === 'pdf') {
      return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const chunks: Buffer[] = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', (err) => reject(err));
        doc.fontSize(12).text(content);
        doc.end();
      });
    }
    if (format === 'docx') {
      const paragraphs = content.split('\n').map((line) => new Paragraph({ children: [new TextRun(line)] }));
      const doc = new Document({ sections: [{ properties: {}, children: paragraphs }] });
      return Packer.toBuffer(doc);
    }
    if (format === 'html') {
      return Promise.resolve(Buffer.from(`<html><body><pre>${content}</pre></body></html>`));
    }
    return Promise.resolve(Buffer.from(JSON.stringify({ content }, null, 2)));
  }
}
