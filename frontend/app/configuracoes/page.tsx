'use client';

import { useEffect, useState } from 'react';
import api from '../../lib/api-client';

export default function ConfiguracoesPage() {
  const [sla, setSla] = useState({ critical: 7, high: 15, medium: 30, low: 60 });
  const [status, setStatus] = useState('');

  useEffect(() => {
    api.get('/sla/config').then((response) => setSla(response.data));
  }, []);

  const handleSave = async () => {
    await api.patch('/sla/config', sla);
    setStatus('Configurações atualizadas');
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="cyber-card space-y-4">
        <h1 className="text-2xl font-display text-primary-light">Configurações de SLA</h1>
        <p className="text-sm text-gray-400">
          Ajuste os prazos de correção de acordo com a política corporativa. Valores em dias corridos.
        </p>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(sla).map(([key, value]) => (
            <label key={key} className="space-y-2 text-sm text-gray-300">
              <span className="uppercase">{key}</span>
              <input
                type="number"
                className="w-full rounded border border-slate-700 bg-slate-900 p-2"
                value={value}
                onChange={(event) => setSla((prev) => ({ ...prev, [key]: Number(event.target.value) }))}
              />
            </label>
          ))}
        </div>
        <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white" onClick={handleSave}>
          Salvar SLA
        </button>
        {status ? <div className="text-xs text-emerald-400">{status}</div> : null}
      </div>
      <div className="cyber-card space-y-2 text-sm text-gray-300">
        <h2 className="text-xl font-display text-primary-light">Integrações suportadas</h2>
        <ul className="list-disc space-y-1 pl-5 text-gray-400">
          <li>Semgrep (CSV/JSON) via CLI e upload</li>
          <li>Nessus, Nmap, Burp Suite, OWASP ZAP (JSON) via API</li>
          <li>Conectores IA (Claude, GPT, Azure OpenAI) configuráveis por variáveis de ambiente</li>
        </ul>
        <p>
          Utilize <code className="rounded bg-slate-900 px-1">make import-semgrep file=./relatorios/semgrep.csv</code> para importar relatórios via CLI.
        </p>
      </div>
    </div>
  );
}
