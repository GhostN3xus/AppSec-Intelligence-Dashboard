'use client';

import { useEffect, useState } from 'react';
import api from '../../lib/api-client';

const domainTypes = [
  { value: 'domain', label: 'Domínio' },
  { value: 'subdomain', label: 'Subdomínio' },
  { value: 'ip', label: 'Endereço IP' },
  { value: 'api', label: 'API' },
];

export default function DomainsPage() {
  const [domains, setDomains] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: '',
    type: 'domain',
    value: '',
    environment: '',
    status: 'active',
    notes: '',
  });
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get('/domains')
      .then((response) => setDomains(response.data ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    await api.post('/domains', form);
    setForm({ name: '', type: 'domain', value: '', environment: '', status: 'active', notes: '' });
    load();
  };

  const handleExport = async () => {
    const response = await api.get('/domains/export/csv/all', { responseType: 'blob' });
    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dominios.csv';
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display text-primary-light">Domínios & Escopo</h1>
          <p className="text-sm text-gray-400">Gerencie ativos externos, APIs e faixas monitoradas pelo programa AppSec.</p>
        </div>
        <button
          onClick={handleExport}
          className="rounded-lg border border-primary/60 px-4 py-2 text-sm font-medium uppercase tracking-wide text-primary hover:bg-primary/10"
        >
          Exportar CSV
        </button>
      </div>
      <div className="cyber-card space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <input
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Nome do ativo"
            className="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
          />
          <select
            value={form.type}
            onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
            className="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
          >
            {domainTypes.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <input
            value={form.value}
            onChange={(e) => setForm((prev) => ({ ...prev, value: e.target.value }))}
            placeholder="URL, IP ou identificador"
            className="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
          />
          <input
            value={form.environment}
            onChange={(e) => setForm((prev) => ({ ...prev, environment: e.target.value }))}
            placeholder="Ambiente (prod, stage...)"
            className="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
          />
          <select
            value={form.status}
            onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
            className="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
          >
            <option value="active">Ativo</option>
            <option value="monitoring">Monitorando</option>
            <option value="deprecated">Desativado</option>
          </select>
          <input
            value={form.notes}
            onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
            placeholder="Observações"
            className="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
          />
        </div>
        <button
          onClick={handleCreate}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white hover:brightness-110"
        >
          Adicionar ativo
        </button>
      </div>
      <div className="cyber-card">
        {loading ? (
          <p className="text-sm text-gray-400">Carregando domínios...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase text-gray-500">
                <tr>
                  <th className="py-2">Ativo</th>
                  <th className="py-2">Tipo</th>
                  <th className="py-2">Valor</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Aplicação</th>
                  <th className="py-2">Responsável</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {domains.map((domain) => (
                  <tr key={domain.id}>
                    <td className="py-3 font-medium text-white">{domain.name}</td>
                    <td className="py-3 text-gray-300">{domain.type}</td>
                    <td className="py-3 text-gray-300">{domain.value}</td>
                    <td className="py-3 text-gray-300">{domain.status}</td>
                    <td className="py-3 text-gray-400">{domain.application?.name ?? '-'}</td>
                    <td className="py-3 text-gray-400">{domain.responsible?.name ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
