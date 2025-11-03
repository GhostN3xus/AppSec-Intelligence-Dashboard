'use client';

import { useEffect, useState } from 'react';
import api from '../../lib/api-client';

export default function ResponsaveisPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get('/responsibles')
      .then((response) => setItems(response.data ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleExport = () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    window.open(`${baseUrl.replace(/\/$/, '')}/api/responsibles/export/excel`, '_blank');
  };

  return (
    <div className="cyber-card">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display text-primary-light">Responsáveis</h1>
          <p className="text-sm text-gray-400">Distribuição de responsáveis por aplicação e SLA</p>
        </div>
        <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white" onClick={handleExport}>
          Baixar Excel
        </button>
      </div>
      {loading ? (
        <p className="mt-4 text-gray-400">Carregando dados...</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase text-gray-500">
              <tr>
                <th className="py-2">Nome</th>
                <th className="py-2">E-mail</th>
                <th className="py-2">Área</th>
                <th className="py-2">Vulnerabilidades</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="py-3 font-medium text-white">{item.name}</td>
                  <td className="py-3 text-gray-300">{item.email}</td>
                  <td className="py-3 text-gray-400">{item.department ?? '-'}</td>
                  <td className="py-3 text-primary-light">{item.vulnerabilities?.length ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
