'use client';

import { useState } from 'react';
import api from '../../lib/api-client';

export default function IaAssistantPage() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    setLoading(true);
    setResponse('');
    try {
      const result = await api.post('/ai/summary', { description: prompt, title: 'Assistente AppSec', impact: 'Contexto livre' });
      setResponse(result.data);
    } catch (error: any) {
      setResponse(error?.response?.data?.message ?? 'Falha ao consultar IA');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display text-primary-light">Assistente IA AppSec</h1>
        <p className="text-sm text-gray-400">
          Gere resumos executivos, identificações de falsos positivos e recomendações automáticas usando modelos Claude/GPT.
        </p>
      </div>
      <div className="cyber-card space-y-4">
        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Descreva o contexto do achado ou peça sugestões de mitigação."
          rows={6}
          className="w-full rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-gray-100 focus:border-primary focus:outline-none"
        />
        <button
          onClick={handleAsk}
          disabled={loading}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white hover:brightness-110 disabled:opacity-60"
        >
          {loading ? 'Consultando...' : 'Gerar insights'}
        </button>
        {response ? <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 text-sm text-gray-100">{response}</div> : null}
      </div>
    </div>
  );
}
