import { Body, BadRequestException, Controller, Get, Post, UploadedFile, UseGuards, UseInterceptors, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IntegrationsService } from './integrations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

@Controller('integrations')
@UseGuards(JwtAuthGuard)
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Post('semgrep')
  @UseInterceptors(FileInterceptor('file'))
  importSemgrep(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    if (!file) {
      throw new BadRequestException('Arquivo não enviado');
    }
    const user = req.user as any;
    return this.integrationsService.importSemgrep(file.buffer, user?.sub, file.originalname);
  }

  @Post('tool')
  importTool(@Body() body: { tool: string; data: any; filename?: string }, @Req() req: Request) {
    if (!body?.tool) {
      throw new BadRequestException('Informe o nome da ferramenta');
    }
    const user = req.user as any;
    return this.integrationsService.importTool(body.tool, body.data, user?.sub, body.filename);
  }

  @Get('history')
  history() {
    return this.integrationsService.history();
  }
}
