'use client';

import { useEffect, useState } from 'react';
import api from '../../lib/api-client';

export default function SlaPage() {
  const [summary, setSummary] = useState<{ overdue: number; atRisk: number; onTrack: number } | null>(null);
  const [vulns, setVulns] = useState<any[]>([]);

  useEffect(() => {
    api.get('/vulnerabilities/sla/summary').then((response) => setSummary(response.data)).catch((err) => console.error('Erro ao carregar resumo SLA:', err));
    api
      .get('/vulnerabilities', { params: { status: 'open' } })
      .then((response) => setVulns(response.data ?? []))
      .catch((err) => console.error('Erro ao carregar vulnerabilidades:', err));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display text-primary-light">Monitor de SLA</h1>
        <p className="text-sm text-gray-400">Visualize os prazos dos achados críticos com semáforo de status.</p>
      </div>
      {summary ? (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-red-200">
            <div className="text-xs uppercase tracking-wide">Vencidos</div>
            <div className="text-3xl font-bold">{summary.overdue}</div>
          </div>
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-amber-200">
            <div className="text-xs uppercase tracking-wide">Em risco</div>
            <div className="text-3xl font-bold">{summary.atRisk}</div>
          </div>
          <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-4 text-emerald-200">
            <div className="text-xs uppercase tracking-wide">No prazo</div>
            <div className="text-3xl font-bold">{summary.onTrack}</div>
          </div>
        </div>
      ) : (
        <div className="cyber-card text-gray-400">Carregando resumo de SLA...</div>
      )}
      <div className="cyber-card">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-display text-primary-light">Vulnerabilidades em aberto</h2>
          <button
            onClick={async () => {
              try {
                const response = await api.get('/vulnerabilities/export/excel', { responseType: 'blob' });
                const url = window.URL.createObjectURL(response.data);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'sla-export.xlsx';
                link.click();
              } catch (error) {
                console.error('Erro ao exportar:', error);
                alert('Erro ao exportar planilha. Tente novamente.');
              }
            }}
            className="rounded-lg border border-primary/60 px-4 py-2 text-xs font-medium uppercase tracking-wide text-primary hover:bg-primary/10"
          >
            Exportar Excel
          </button>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase text-gray-500">
              <tr>
                <th className="py-2">Título</th>
                <th className="py-2">Severidade</th>
                <th className="py-2">Responsável</th>
                <th className="py-2">Aplicação</th>
                <th className="py-2">Due Date</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {vulns.map((vuln) => {
                const dueDate = new Date(vuln.dueDate);
                const remaining = dueDate.getTime() - Date.now();
                const badge = remaining < 0 ? 'bg-red-500/20 text-red-300' : remaining < 3 * 24 * 3600 * 1000 ? 'bg-amber-500/20 text-amber-200' : 'bg-emerald-500/20 text-emerald-200';
                const label = remaining < 0 ? 'Vencido' : remaining < 3 * 24 * 3600 * 1000 ? 'Em risco' : 'No prazo';
                return (
                  <tr key={vuln.id}>
                    <td className="py-3 font-medium text-white">{vuln.title}</td>
                    <td className="py-3 text-gray-300">{vuln.severity}</td>
                    <td className="py-3 text-gray-300">{vuln.responsible?.name ?? '-'}</td>
                    <td className="py-3 text-gray-400">{vuln.application?.name ?? '-'}</td>
                    <td className="py-3 text-gray-300">{dueDate.toLocaleDateString()}</td>
                    <td className="py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge}`}>{label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
