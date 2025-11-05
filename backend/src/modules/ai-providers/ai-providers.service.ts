import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import axios from 'axios';
import { AiProvider, AiProviderConfigDto } from './dto/ai-provider.dto';

export interface AiResponse {
  content: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

@Injectable()
export class AiProvidersService {
  private readonly logger = new Logger(AiProvidersService.name);

  constructor(private prisma: PrismaService) {}

  async getAvailableProviders() {
    return {
      providers: [
        {
          id: AiProvider.OPENAI,
          name: 'OpenAI (ChatGPT)',
          description: 'GPT-4, GPT-3.5-turbo e outros modelos da OpenAI',
          models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
          requiresApiKey: true,
        },
        {
          id: AiProvider.ANTHROPIC,
          name: 'Anthropic (Claude)',
          description: 'Claude 3 Opus, Sonnet e Haiku',
          models: [
            'claude-3-opus-20240229',
            'claude-3-sonnet-20240229',
            'claude-3-haiku-20240307',
          ],
          requiresApiKey: true,
        },
        {
          id: AiProvider.GEMINI,
          name: 'Google Gemini',
          description: 'Gemini Pro e outros modelos do Google',
          models: ['gemini-pro', 'gemini-pro-vision'],
          requiresApiKey: true,
        },
        {
          id: AiProvider.DEEPSEEK,
          name: 'DeepSeek',
          description: 'Modelos DeepSeek para análise de código',
          models: ['deepseek-coder', 'deepseek-chat'],
          requiresApiKey: true,
        },
        {
          id: AiProvider.LOCAL,
          name: 'LLM Local',
          description: 'Ollama, LM Studio, ou qualquer API compatível com OpenAI',
          models: ['llama2', 'codellama', 'mistral', 'custom'],
          requiresApiKey: false,
          requiresEndpoint: true,
        },
      ],
    };
  }

  async getConfiguration() {
    const config = await this.prisma.integrationConfig.findUnique({
      where: { provider: 'ai-provider' },
    });

    if (!config) {
      return {
        provider: AiProvider.OPENAI,
        model: 'gpt-3.5-turbo',
        configured: false,
      };
    }

    return {
      provider: config.settings.provider,
      model: config.settings.model,
      endpoint: config.settings.endpoint,
      configured: true,
    };
  }

  async updateConfiguration(configDto: AiProviderConfigDto) {
    const settings = {
      provider: configDto.provider,
      apiKey: configDto.apiKey,
      endpoint: configDto.endpoint,
      model: configDto.model,
      options: configDto.options || {},
    };

    await this.prisma.integrationConfig.upsert({
      where: { provider: 'ai-provider' },
      create: {
        provider: 'ai-provider',
        settings,
      },
      update: {
        settings,
      },
    });

    return { success: true, message: 'Configuração atualizada com sucesso' };
  }

  async testProvider(
    provider: AiProvider,
    apiKey?: string,
    endpoint?: string,
  ): Promise<{ success: boolean; message: string; error?: string }> {
    try {
      const response = await this.callProvider(
        provider,
        'Responda apenas com "OK" se você pode me ouvir.',
        apiKey,
        endpoint,
      );

      return {
        success: true,
        message: `Provedor ${provider} testado com sucesso. Resposta: ${response.content.substring(0, 100)}`,
      };
    } catch (error) {
      this.logger.error(`Erro ao testar provedor ${provider}: ${error.message}`);
      return {
        success: false,
        message: `Falha ao testar provedor ${provider}`,
        error: error.message,
      };
    }
  }

  async query(prompt: string, context?: string): Promise<AiResponse> {
    const config = await this.getConfiguration();

    if (!config.configured) {
      throw new BadRequestException(
        'Nenhum provedor de IA configurado. Configure um provedor em Configurações > Integrações.',
      );
    }

    const fullPrompt = context ? `${context}\n\n${prompt}` : prompt;

    return this.callProvider(
      config.provider,
      fullPrompt,
      undefined,
      config.endpoint,
      config.model,
    );
  }

  async analyzeVulnerability(vulnerabilityId: string): Promise<AiResponse> {
    const vulnerability = await this.prisma.vulnerability.findUnique({
      where: { id: vulnerabilityId },
      include: {
        findings: true,
        application: true,
      },
    });

    if (!vulnerability) {
      throw new BadRequestException('Vulnerabilidade não encontrada');
    }

    const prompt = `
Analise a seguinte vulnerabilidade de segurança e forneça uma análise detalhada:

Título: ${vulnerability.title}
Severidade: ${vulnerability.severity}
Tipo: ${vulnerability.type || 'N/A'}
CWE: ${vulnerability.cwe || 'N/A'}
OWASP: ${vulnerability.owasp || 'N/A'}

Descrição: ${vulnerability.description || 'Sem descrição'}

Aplicação: ${vulnerability.application?.name || 'N/A'}

Por favor, forneça:
1. Explicação técnica da vulnerabilidade
2. Possíveis vetores de ataque
3. Impacto potencial no negócio
4. Análise de risco considerando o contexto da aplicação
5. Priorização de correção
`;

    return this.query(prompt);
  }

  async generateRemediation(vulnerabilityId: string): Promise<AiResponse> {
    const vulnerability = await this.prisma.vulnerability.findUnique({
      where: { id: vulnerabilityId },
      include: {
        findings: {
          take: 1,
        },
        application: true,
      },
    });

    if (!vulnerability) {
      throw new BadRequestException('Vulnerabilidade não encontrada');
    }

    const finding = vulnerability.findings[0];
    const codeContext = finding?.context || '';

    const prompt = `
Gere um plano de remediação detalhado para a seguinte vulnerabilidade:

Título: ${vulnerability.title}
Severidade: ${vulnerability.severity}
Tipo: ${vulnerability.type || 'N/A'}
CWE: ${vulnerability.cwe || 'N/A'}
Stack da aplicação: ${vulnerability.application?.stack || 'N/A'}

${codeContext ? `Contexto do código:\n\`\`\`\n${codeContext}\n\`\`\`` : ''}

Por favor, forneça:
1. Passo a passo para correção
2. Exemplo de código corrigido (se aplicável)
3. Melhores práticas para prevenir vulnerabilidades similares
4. Recursos adicionais e referências
5. Testes de segurança recomendados
`;

    return this.query(prompt);
  }

  private async callProvider(
    provider: AiProvider,
    prompt: string,
    apiKey?: string,
    endpoint?: string,
    model?: string,
  ): Promise<AiResponse> {
    // Se não foi passado apiKey/endpoint, buscar da configuração
    if (!apiKey && !endpoint) {
      const config = await this.prisma.integrationConfig.findUnique({
        where: { provider: 'ai-provider' },
      });

      if (config?.settings) {
        apiKey = config.settings.apiKey;
        endpoint = config.settings.endpoint;
        model = model || config.settings.model;
      }
    }

    switch (provider) {
      case AiProvider.OPENAI:
        return this.callOpenAI(prompt, apiKey, model);
      case AiProvider.ANTHROPIC:
        return this.callAnthropic(prompt, apiKey, model);
      case AiProvider.GEMINI:
        return this.callGemini(prompt, apiKey, model);
      case AiProvider.DEEPSEEK:
        return this.callDeepSeek(prompt, apiKey, model);
      case AiProvider.LOCAL:
        return this.callLocal(prompt, endpoint, model);
      default:
        throw new BadRequestException(`Provedor ${provider} não suportado`);
    }
  }

  private async callOpenAI(
    prompt: string,
    apiKey?: string,
    model = 'gpt-3.5-turbo',
  ): Promise<AiResponse> {
    if (!apiKey) {
      throw new BadRequestException('API Key da OpenAI não configurada');
    }

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
        },
      );

      return {
        content: response.data.choices[0].message.content,
        usage: {
          promptTokens: response.data.usage.prompt_tokens,
          completionTokens: response.data.usage.completion_tokens,
          totalTokens: response.data.usage.total_tokens,
        },
      };
    } catch (error) {
      this.logger.error(`Erro ao chamar OpenAI: ${error.message}`);
      throw new BadRequestException(
        `Erro ao chamar OpenAI: ${error.response?.data?.error?.message || error.message}`,
      );
    }
  }

  private async callAnthropic(
    prompt: string,
    apiKey?: string,
    model = 'claude-3-sonnet-20240229',
  ): Promise<AiResponse> {
    if (!apiKey) {
      throw new BadRequestException('API Key da Anthropic não configurada');
    }

    try {
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model,
          max_tokens: 4096,
          messages: [{ role: 'user', content: prompt }],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
        },
      );

      return {
        content: response.data.content[0].text,
        usage: {
          promptTokens: response.data.usage.input_tokens,
          completionTokens: response.data.usage.output_tokens,
        },
      };
    } catch (error) {
      this.logger.error(`Erro ao chamar Anthropic: ${error.message}`);
      throw new BadRequestException(
        `Erro ao chamar Anthropic: ${error.response?.data?.error?.message || error.message}`,
      );
    }
  }

  private async callGemini(
    prompt: string,
    apiKey?: string,
    model = 'gemini-pro',
  ): Promise<AiResponse> {
    if (!apiKey) {
      throw new BadRequestException('API Key do Google Gemini não configurada');
    }

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
        {
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      return {
        content: response.data.candidates[0].content.parts[0].text,
        usage: {
          promptTokens: response.data.usageMetadata?.promptTokenCount,
          completionTokens: response.data.usageMetadata?.candidatesTokenCount,
          totalTokens: response.data.usageMetadata?.totalTokenCount,
        },
      };
    } catch (error) {
      this.logger.error(`Erro ao chamar Gemini: ${error.message}`);
      throw new BadRequestException(
        `Erro ao chamar Gemini: ${error.response?.data?.error?.message || error.message}`,
      );
    }
  }

  private async callDeepSeek(
    prompt: string,
    apiKey?: string,
    model = 'deepseek-chat',
  ): Promise<AiResponse> {
    if (!apiKey) {
      throw new BadRequestException('API Key da DeepSeek não configurada');
    }

    try {
      const response = await axios.post(
        'https://api.deepseek.com/v1/chat/completions',
        {
          model,
          messages: [{ role: 'user', content: prompt }],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
        },
      );

      return {
        content: response.data.choices[0].message.content,
        usage: {
          promptTokens: response.data.usage?.prompt_tokens,
          completionTokens: response.data.usage?.completion_tokens,
          totalTokens: response.data.usage?.total_tokens,
        },
      };
    } catch (error) {
      this.logger.error(`Erro ao chamar DeepSeek: ${error.message}`);
      throw new BadRequestException(
        `Erro ao chamar DeepSeek: ${error.response?.data?.error?.message || error.message}`,
      );
    }
  }

  private async callLocal(
    prompt: string,
    endpoint?: string,
    model = 'llama2',
  ): Promise<AiResponse> {
    if (!endpoint) {
      throw new BadRequestException(
        'Endpoint do LLM local não configurado. Configure o endpoint (ex: http://localhost:11434)',
      );
    }

    try {
      // Suporte para API compatível com OpenAI (Ollama, LM Studio, etc)
      const response = await axios.post(
        `${endpoint}/v1/chat/completions`,
        {
          model,
          messages: [{ role: 'user', content: prompt }],
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 60000, // 60 segundos para LLMs locais
        },
      );

      return {
        content: response.data.choices[0].message.content,
        usage: response.data.usage
          ? {
              promptTokens: response.data.usage.prompt_tokens,
              completionTokens: response.data.usage.completion_tokens,
              totalTokens: response.data.usage.total_tokens,
            }
          : undefined,
      };
    } catch (error) {
      this.logger.error(`Erro ao chamar LLM local: ${error.message}`);
      throw new BadRequestException(
        `Erro ao chamar LLM local: ${error.message}. Verifique se o endpoint está correto e o servidor está rodando.`,
      );
    }
  }
}
