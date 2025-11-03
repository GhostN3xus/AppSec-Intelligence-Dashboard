'use client';

import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import api from '../../../lib/api-client';
import { ArrowPathIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';

type DependencyFinding = {
  id: string;
  package: string;
  version?: string | null;
  ecosystem?: string | null;
  severity?: string | null;
  advisoryId?: string | null;
  dependencyFile?: string | null;
  application?: { name?: string | null } | null;
  createdAt: string;
};

type EcosystemMetric = {
  ecosystem: string;
  total: number;
};

type TopDependency = {
  package: string;
  version: string | null;
  count: number;
  ecosystem?: string | null;
  severity?: string | null;
};

export default function ScaPage() {
  const [rows, setRows] = useState<DependencyFinding[]>([]);
  const [ecosystems, setEcosystems] = useState<EcosystemMetric[]>([]);
  const [top, setTop] = useState<TopDependency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [filters, setFilters] = useState({ ecosystem: '', severity: '', query: '' });

  const loadDependencies = useCallback(() => {
    setLoading(true);
    setError(null);
    api
      .get<DependencyFinding[]>('/sca/dependencies', {
        params: {
          ecosystem: filters.ecosystem || undefined,
          severity: filters.severity || undefined,
        },
      })
      .then((response) => setRows(response.data ?? []))
      .catch(() => setError('Não foi possível carregar os findings de SCA.'))
      .finally(() => setLoading(false));
  }, [filters.ecosystem, filters.severity]);

  const loadMetrics = useCallback(() => {
    api.get<EcosystemMetric[]>('/sca/dependencies/metrics/ecosystem').then((response) => setEcosystems(response.data ?? []));
    api.get<TopDependency[]>('/sca/dependencies/top').then((response) => setTop(response.data ?? []));
  }, []);

  useEffect(() => {
    loadDependencies();
  }, [loadDependencies]);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  const filteredRows = useMemo(() => {
    const query = filters.query.toLowerCase();
    if (!query) return rows;
    return rows.filter((row) => {
      return (
        row.package.toLowerCase().includes(query) ||
        (row.dependencyFile ?? '').toLowerCase().includes(query) ||
        (row.advisoryId ?? '').toLowerCase().includes(query)
      );
    });
  }, [rows, filters.query]);

  const formatSeverity = useCallback((value?: string | null) => {
    if (!value) return '—';
    const normalized = value.toLowerCase();
    const labels: Record<string, string> = {
      critical: 'Crítica',
      high: 'Alta',
      medium: 'Média',
      low: 'Baixa',
    };
    return labels[normalized] ?? value;
  }, []);

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
      await api.post('/import/sca', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (!progressEvent.total) return;
          setProgress(Math.round((progressEvent.loaded / progressEvent.total) * 100));
        },
      });
      loadDependencies();
      loadMetrics();
    } catch (err) {
      console.error(err);
      setError('Falha ao importar o CSV de SCA.');
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
          <h1 className="text-3xl font-display text-primary-light">Análise de Dependências (SCA)</h1>
          <p className="text-sm text-gray-400">
            Faça upload do relatório de dependências vulneráveis (Semgrep Supply Chain ou ferramenta similar) para acompanhar os pacotes mais críticos.
          </p>
        </div>
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-primary/60 bg-slate-950/70 px-4 py-2 text-sm font-medium uppercase tracking-wide text-primary hover:bg-primary/10">
          <CloudArrowUpIcon className="h-5 w-5" /> Importar CSV SCA
          <input type="file" accept=".csv" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {ecosystems.map((item) => (
          <div key={item.ecosystem} className="cyber-card space-y-2">
            <span className="text-xs uppercase text-gray-500">{item.ecosystem}</span>
            <div className="text-2xl font-semibold text-white">{item.total}</div>
            <div className="h-2 rounded-full bg-slate-800">
              <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min(item.total * 10, 100)}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="cyber-card space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-3">
            <select
              value={filters.ecosystem}
              onChange={(event) => setFilters((prev) => ({ ...prev, ecosystem: event.target.value }))}
              className="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-gray-200 focus:border-primary focus:outline-none"
            >
              <option value="">Todos os ecossistemas</option>
              {ecosystems.map((item) => (
                <option key={item.ecosystem} value={item.ecosystem}>
                  {item.ecosystem}
                </option>
              ))}
            </select>
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
              placeholder="Buscar por pacote, arquivo ou advisory"
              className="w-64 rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-gray-200 focus:border-primary focus:outline-none"
            />
          </div>
          <button
            onClick={() => {
              loadDependencies();
              loadMetrics();
            }}
            className="flex items-center gap-2 rounded-lg border border-primary/60 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-primary hover:bg-primary/10"
          >
            <ArrowPathIcon className="h-4 w-4" /> Atualizar
          </button>
        </div>

        {error && <div className="rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div>}
        {uploading && (
          <div className="rounded border border-primary/50 bg-primary/10 px-3 py-2 text-sm text-primary">
            Importando relatório SCA... {progress}%
          </div>
        )}

        {loading ? (
          <div className="text-sm text-gray-400">Carregando dependências vulneráveis...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="py-2">Pacote</th>
                  <th className="py-2">Versão</th>
                  <th className="py-2">Ecossistema</th>
                  <th className="py-2">Severidade</th>
                  <th className="py-2">Advisory</th>
                  <th className="py-2">Arquivo</th>
                  <th className="py-2">Aplicação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredRows.map((row) => (
                  <tr key={row.id}>
                    <td className="py-3 font-medium text-white">{row.package}</td>
                    <td className="py-3 text-gray-300">{row.version ?? '—'}</td>
                    <td className="py-3 uppercase text-gray-400">{row.ecosystem ?? '—'}</td>
                    <td className="py-3 capitalize text-gray-300">{formatSeverity(row.severity)}</td>
                    <td className="py-3 text-gray-400">{row.advisoryId ?? '—'}</td>
                    <td className="py-3 text-gray-400">{row.dependencyFile ?? '—'}</td>
                    <td className="py-3 text-gray-400">{row.application?.name ?? 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="cyber-card space-y-4">
        <h2 className="text-lg font-semibold text-white">Top dependências vulneráveis</h2>
        <div className="space-y-2">
          {top.map((item) => (
            <div key={`${item.package}-${item.version ?? 'latest'}`} className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">
                    {item.package}{' '}
                    <span className="text-xs text-gray-400">{item.version ?? 'sem versão'}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.ecosystem ?? 'ecossistema desconhecido'} · severidade {formatSeverity(item.severity)}
                  </p>
                </div>
                <span className="text-sm font-semibold text-primary">{item.count} ocorrências</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
