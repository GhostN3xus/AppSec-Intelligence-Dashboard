'use client';

import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import api from '../../lib/api-client';
import { ArrowPathIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';

type Vulnerability = {
  id: string;
  title: string;
  severity: string;
  type?: string | null;
  application?: { name?: string } | null;
  createdAt: string;
  dueDate: string;
  status?: string;
};

type SeverityCounts = Record<'critical' | 'high' | 'medium' | 'low', number>;

const initialCounts: SeverityCounts = { critical: 0, high: 0, medium: 0, low: 0 };
const severityLabels: Record<keyof SeverityCounts, string> = {
  critical: 'Crítica',
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa',
};

const toolOptions = [
  { value: 'Burp Suite', label: 'Burp Suite' },
  { value: 'ZAP', label: 'OWASP ZAP' },
  { value: 'Nessus', label: 'Nessus' },
  { value: 'Acunetix', label: 'Acunetix' },
  { value: 'DAST', label: 'Outro DAST' },
];

export default function DastPage() {
  const [rows, setRows] = useState<Vulnerability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [filters, setFilters] = useState({ severity: '', query: '' });
  const [selectedTool, setSelectedTool] = useState('ZAP');

  const loadFindings = useCallback(() => {
    setLoading(true);
    setError(null);
    api
      .get<Vulnerability[]>('/vulnerabilities', {
        params: {
          type: 'dast',
          severity: filters.severity || undefined,
        },
      })
      .then((response) => {
        setRows(response.data ?? []);
      })
      .catch(() => setError('Não foi possível carregar as vulnerabilidades DAST.'))
      .finally(() => setLoading(false));
  }, [filters.severity]);

  useEffect(() => {
    loadFindings();
  }, [loadFindings]);

  const severitySummary = useMemo(() => {
    return rows.reduce((acc, vuln) => {
      const key = (vuln.severity?.toLowerCase() ?? 'medium') as keyof SeverityCounts;
      if (acc[key] !== undefined) {
        acc[key] += 1;
      }
      return acc;
    }, { ...initialCounts });
  }, [rows]);

  const formatSeverity = useCallback(
    (value: string) => severityLabels[value?.toLowerCase() as keyof SeverityCounts] ?? value,
    [],
  );

  const filteredRows = useMemo(() => {
    const query = filters.query.toLowerCase();
    if (!query) {
      return rows;
    }
    return rows.filter((vuln) => {
      return (
        vuln.title.toLowerCase().includes(query) ||
        (vuln.application?.name ?? '').toLowerCase().includes(query)
      );
    });
  }, [rows, filters.query]);

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setUploading(true);
    setProgress(0);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tool', selectedTool);

      await api.post('/integrations/dast', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (!progressEvent.total) return;
          setProgress(Math.round((progressEvent.loaded / progressEvent.total) * 100));
        },
      });
      loadFindings();
    } catch (err) {
      console.error(err);
      setError('Falha ao importar o relatório DAST.');
    } finally {
      setUploading(false);
      setProgress(0);
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-display text-primary-light">Findings DAST (Burp, ZAP, Nessus)</h1>
          <p className="text-sm text-gray-400">
            Consolidação das vulnerabilidades dinâmicas e de infraestrutura com status de SLA.
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <select
            value={selectedTool}
            onChange={(e) => setSelectedTool(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-gray-200 focus:border-primary focus:outline-none"
          >
            {toolOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-primary/60 bg-slate-950/70 px-4 py-2 text-sm font-medium uppercase tracking-wide text-primary hover:bg-primary/10">
            <CloudArrowUpIcon className="h-5 w-5" /> Importar Relatório
            <input type="file" accept=".json,.xml,.csv" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {Object.entries(severitySummary).map(([severity, total]) => (
          <div key={severity} className="cyber-card space-y-2">
            <span className="text-xs uppercase text-gray-500">
              {severityLabels[severity as keyof SeverityCounts] ?? severity}
            </span>
            <div className="text-2xl font-semibold text-white">{total}</div>
            <div className="h-2 rounded-full bg-slate-800">
              <div
                className="h-2 rounded-full bg-primary"
                style={{ width: `${rows.length ? Math.round((total / rows.length) * 100) : 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="cyber-card space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-3">
            <select
              value={filters.severity}
              onChange={(event) => setFilters((prev) => ({ ...prev, severity: event.target.value }))}
              className="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-gray-200 focus:border-primary focus:outline-none"
            >
              <option value="">Todas as severidades</option>
              <option value="critical">Crítica</option>
              <option value="high">Alta</option>
              <option value="medium">Média</option>
              <option value="low">Baixa</option>
            </select>
            <input
              value={filters.query}
              onChange={(event) => setFilters((prev) => ({ ...prev, query: event.target.value }))}
              placeholder="Buscar por título ou aplicação"
              className="w-64 rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-gray-200 focus:border-primary focus:outline-none"
            />
          </div>
          <button
            onClick={loadFindings}
            className="flex items-center gap-2 rounded-lg border border-primary/60 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-primary hover:bg-primary/10"
          >
            <ArrowPathIcon className="h-4 w-4" /> Atualizar
          </button>
        </div>

        {error && <div className="rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div>}
        {uploading && (
          <div className="rounded border border-primary/50 bg-primary/10 px-3 py-2 text-sm text-primary">
            Importando relatório... {progress}%
          </div>
        )}

        {loading ? (
          <div className="text-sm text-gray-400">Carregando findings DAST...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="py-2">Título</th>
                  <th className="py-2">Severidade</th>
                  <th className="py-2">Tipo</th>
                  <th className="py-2">Aplicação</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">SLA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      Nenhuma vulnerabilidade DAST encontrada.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((vuln) => (
                    <tr key={vuln.id}>
                      <td className="py-3 font-medium text-white">{vuln.title}</td>
                      <td className="py-3 capitalize text-gray-300">{formatSeverity(vuln.severity)}</td>
                      <td className="py-3 text-gray-300">{vuln.type ?? 'DAST'}</td>
                      <td className="py-3 text-gray-400">{vuln.application?.name ?? 'N/A'}</td>
                      <td className="py-3">
                        <span className={`rounded-full px-3 py-1 text-xs uppercase ${
                          vuln.status === 'open' ? 'bg-red-500/20 text-red-300' :
                          vuln.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-green-500/20 text-green-300'
                        }`}>
                          {vuln.status ?? 'open'}
                        </span>
                      </td>
                      <td className="py-3 text-gray-400">{vuln.dueDate ? new Date(vuln.dueDate).toLocaleDateString() : '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
