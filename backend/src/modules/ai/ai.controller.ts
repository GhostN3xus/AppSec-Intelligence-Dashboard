import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('triage')
  triage(@Body() body: { findings: any[] }) {
    return this.aiService.triageFindings(body.findings ?? []);
  }

  @Post('summary')
  summary(@Body() body: { title: string; description?: string; impact?: string; remediation?: string }) {
    return this.aiService.summarizeVulnerability(body);
  }

  @Post('remediation')
  remediation(@Body() body: { technology: string; weakness: string }) {
    return this.aiService.remediationRecommendation(body);
  }
}
