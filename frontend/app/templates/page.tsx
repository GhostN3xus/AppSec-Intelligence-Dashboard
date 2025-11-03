'use client';

import { useEffect, useState } from 'react';
import api from '../../lib/api-client';

const formats = [
  { value: 'pdf', label: 'PDF' },
  { value: 'docx', label: 'Word' },
  { value: 'html', label: 'HTML' },
  { value: 'json', label: 'JSON' },
];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [name, setName] = useState('Relatorio-AppSec');
  const [format, setFormat] = useState('pdf');

  const load = () => {
    api.get('/reports/templates').then((response) => setTemplates(response.data ?? []));
  };

  useEffect(() => {
    load();
  }, []);

  const handleDownload = async () => {
    if (!selected) return;
    const response = await api.post(
      '/reports/generate',
      { name, templateId: selected, format, payload: { resumo: 'Resumo automático', vulnerabilidades: 'Nenhum item.' } },
      { responseType: 'blob' },
    );
    const blob = new Blob([response.data], { type: response.headers['content-type'] });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${name}.${format}`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="space-y-6">
      <div className="cyber-card">
        <h1 className="text-2xl font-display text-primary-light">Biblioteca de Templates</h1>
        <p className="text-sm text-gray-400">
          Modelos padronizados para relatórios técnicos, executivos, planos de remediação e status de SLA.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <div className="cyber-card space-y-2">
          <h2 className="text-lg font-display text-primary-light">Modelos disponíveis</h2>
          <ul className="space-y-2 text-sm text-gray-300">
            {templates.map((template) => (
              <li key={template.id}>
                <button
                  className={`w-full rounded border border-slate-800 px-3 py-2 text-left transition hover:border-primary/60 ${
                    selected === template.id ? 'border-primary/70 bg-primary/10 text-primary-light' : ''
                  }`}
                  onClick={() => setSelected(template.id)}
                >
                  <div className="font-medium">{template.name}</div>
                  <div className="text-xs text-gray-500">{template.category}</div>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="cyber-card space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-gray-300">
              <span>Nome do relatório</span>
              <input
                className="w-full rounded border border-slate-700 bg-slate-900 p-2"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
            <label className="space-y-2 text-sm text-gray-300">
              <span>Formato</span>
              <select
                className="w-full rounded border border-slate-700 bg-slate-900 p-2"
                value={format}
                onChange={(event) => setFormat(event.target.value)}
              >
                {formats.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button
            className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-700"
            disabled={!selected}
            onClick={handleDownload}
          >
            Exportar relatório
          </button>
          <div className="text-xs text-gray-500">
            Os templates englobam: Pentest técnico/executivo, Relatórios SAST (Semgrep), DAST (Burp/ZAP), API Security,
            Planos de Remediação, Revisões de falso positivo e Status de SLA.
          </div>
        </div>
      </div>
    </div>
  );
}
