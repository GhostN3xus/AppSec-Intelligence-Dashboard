import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export enum AiProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GEMINI = 'gemini',
  DEEPSEEK = 'deepseek',
  LOCAL = 'local',
}

export class AiQueryDto {
  @IsString()
  @IsNotEmpty()
  prompt: string;

  @IsString()
  @IsOptional()
  context?: string;
}

export class AiProviderConfigDto {
  @IsEnum(AiProvider)
  provider: AiProvider;

  @IsString()
  @IsOptional()
  apiKey?: string;

  @IsString()
  @IsOptional()
  endpoint?: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsOptional()
  options?: Record<string, any>;
}

export class TestProviderDto {
  @IsEnum(AiProvider)
  provider: AiProvider;

  @IsString()
  @IsOptional()
  apiKey?: string;

  @IsString()
  @IsOptional()
  endpoint?: string;
}
