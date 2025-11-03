import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

interface FindingInput {
  id: string;
  title: string;
  severity: string;
  description?: string;
  evidence?: string;
}

@Injectable()
export class AiService {
  private openai?: OpenAI;
  constructor(private readonly config: ConfigService) {
    const key = this.config.get<string>('OPENAI_API_KEY');
    if (key) {
      this.openai = new OpenAI({ apiKey: key });
    }
  }

  async triageFindings(findings: FindingInput[]) {
    if (!findings.length) {
      return [];
    }
    if (!this.openai) {
      return findings.map((finding) => ({
        id: finding.id,
        classification: finding.severity === 'low' ? 'likely_false_positive' : 'needs_review',
        rationale: 'Fallback triage without LLM. Prioritize manual review for higher severities.',
      }));
    }

    const prompt = `Você é um analista AppSec. Classifique cada achado como verdadeiro, falso positivo ou revisar.
Responda em JSON com campos id, classification (true_positive|false_positive|needs_review) e rationale.

Achados:\n${findings
      .map((f) => `ID: ${f.id}\nSeveridade: ${f.severity}\nTitulo: ${f.title}\nDescrição: ${f.description ?? 'N/A'}\nEvidências: ${f.evidence ?? 'N/A'}`)
      .join('\n---\n')}`;

    const responseText = await this.invokeModel(prompt);
    try {
      return JSON.parse(responseText);
    } catch (error) {
      return findings.map((finding) => ({
        id: finding.id,
        classification: 'needs_review',
        rationale: 'Falha ao interpretar resposta da IA. Revisar manualmente.',
      }));
    }
  }

  async summarizeVulnerability(details: { title: string; description?: string; impact?: string; remediation?: string }) {
    const prompt = `Crie um resumo executivo curto para a vulnerabilidade abaixo.
Título: ${details.title}
Descrição: ${details.description ?? 'N/A'}
Impacto: ${details.impact ?? 'N/A'}
Recomendação: ${details.remediation ?? 'N/A'}`;
    const text = await this.invokeModel(prompt);
    return text.trim();
  }

  async remediationRecommendation(details: { technology: string; weakness: string }) {
    const prompt = `Forneça passos de correção práticos para ${details.technology} considerando a falha ${details.weakness}.`;
    const text = await this.invokeModel(prompt);
    return text.trim();
  }

  private async invokeModel(prompt: string) {
    if (this.openai) {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Você é um assistente AppSec.' },
          { role: 'user', content: prompt },
        ],
      });
      const choice = completion.choices?.[0]?.message?.content;
      if (choice) {
        return choice;
      }
    }
    return 'Sem resposta disponível.';
  }
}
