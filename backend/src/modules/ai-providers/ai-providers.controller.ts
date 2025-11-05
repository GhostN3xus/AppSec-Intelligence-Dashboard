import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AiProvidersService, AiResponse } from './ai-providers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import {
  AiQueryDto,
  AiProviderConfigDto,
  TestProviderDto,
} from './dto/ai-provider.dto';

@Controller('ai-providers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AiProvidersController {
  constructor(private readonly aiProvidersService: AiProvidersService) {}

  @Get('available')
  async getAvailableProviders() {
    return this.aiProvidersService.getAvailableProviders();
  }

  @Get('config')
  @Roles(UserRole.admin, UserRole.owner)
  async getConfiguration() {
    return this.aiProvidersService.getConfiguration();
  }

  @Post('config')
  @Roles(UserRole.admin, UserRole.owner)
  async updateConfiguration(@Body() config: AiProviderConfigDto) {
    return this.aiProvidersService.updateConfiguration(config);
  }

  @Post('test')
  @Roles(UserRole.admin, UserRole.owner)
  @HttpCode(HttpStatus.OK)
  async testProvider(@Body() testDto: TestProviderDto) {
    return this.aiProvidersService.testProvider(
      testDto.provider,
      testDto.apiKey,
      testDto.endpoint,
    );
  }

  @Post('query')
  async queryAi(@Body() query: AiQueryDto): Promise<AiResponse> {
    return this.aiProvidersService.query(query.prompt, query.context);
  }

  @Post('analyze-vulnerability')
  async analyzeVulnerability(
    @Body() body: { vulnerabilityId: string },
  ): Promise<AiResponse> {
    return this.aiProvidersService.analyzeVulnerability(body.vulnerabilityId);
  }

  @Post('generate-remediation')
  async generateRemediation(
    @Body() body: { vulnerabilityId: string },
  ): Promise<AiResponse> {
    return this.aiProvidersService.generateRemediation(body.vulnerabilityId);
  }
}
