import {
  Body,
  BadRequestException,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IntegrationsService } from './integrations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '@prisma/client';

@Controller('integrations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Post('semgrep')
  @Roles(UserRole.admin, UserRole.analyst)
  @UseInterceptors(FileInterceptor('file'))
  importSemgrep(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    if (!file) {
      throw new BadRequestException('Arquivo não enviado');
    }
    const user = req.user as any;
    return this.integrationsService.importSemgrep(file.buffer, user?.sub, file.originalname);
  }

  @Post('dast')
  @Roles(UserRole.admin, UserRole.analyst)
  @UseInterceptors(FileInterceptor('file'))
  importDast(@UploadedFile() file: Express.Multer.File, @Body() body: { tool?: string }, @Req() req: Request) {
    if (!file) {
      throw new BadRequestException('Arquivo não enviado');
    }
    const user = req.user as any;
    const tool = body.tool || 'DAST';
    return this.integrationsService.importDast(file.buffer, tool, user?.sub, file.originalname);
  }

  @Post('tool')
  @Roles(UserRole.admin, UserRole.analyst)
  importTool(@Body() body: { tool: string; data: any; filename?: string }, @Req() req: Request) {
    if (!body?.tool) {
      throw new BadRequestException('Informe o nome da ferramenta');
    }
    const user = req.user as any;
    return this.integrationsService.importTool(body.tool, body.data, user?.sub, body.filename);
  }

  @Get('history')
  @Roles(UserRole.admin, UserRole.analyst, UserRole.auditor)
  history() {
    return this.integrationsService.history();
  }

  @Get()
  @Roles(UserRole.admin, UserRole.analyst)
  status() {
    return this.integrationsService.getIntegrationStatuses();
  }

  @Post('telegram')
  @Roles(UserRole.admin)
  configureTelegram(@Body() body: { botToken: string; chatId: string; enabled?: boolean }) {
    return this.integrationsService.saveIntegrationConfig('telegram', {
      botToken: body.botToken,
      chatId: body.chatId,
      enabled: body.enabled ?? true,
      updatedAt: new Date().toISOString(),
    });
  }

  @Post('email')
  @Roles(UserRole.admin)
  configureEmail(@Body() body: { recipients: string[]; enabled?: boolean }) {
    return this.integrationsService.saveIntegrationConfig('email', {
      recipients: body.recipients,
      enabled: body.enabled ?? true,
      updatedAt: new Date().toISOString(),
    });
  }
}
