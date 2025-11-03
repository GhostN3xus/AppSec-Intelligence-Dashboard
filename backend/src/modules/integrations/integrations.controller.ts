import { Body, BadRequestException, Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IntegrationsService } from './integrations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('integrations')
@UseGuards(JwtAuthGuard)
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Post('semgrep')
  @UseInterceptors(FileInterceptor('file'))
  importSemgrep(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Arquivo não enviado');
    }
    return this.integrationsService.importSemgrep(file.buffer);
  }

  @Post('tool')
  importTool(@Body() body: { tool: string; data: any }) {
    if (!body?.tool) {
      throw new BadRequestException('Informe o nome da ferramenta');
    }
    return this.integrationsService.importTool(body.tool, body.data);
  }
}
