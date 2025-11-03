'use client';

import { useEffect, useState } from 'react';
import api from '../../lib/api-client';

export default function InventoryPage() {
  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    api.get('/inventory/summary').then((response) => setData(response.data));
  }, []);

  if (!data) {
    return <div className="cyber-card text-gray-400">Carregando inventário...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display text-primary-light">Inventário AppSec</h1>
        <p className="text-sm text-gray-400">Resumo das aplicações, responsáveis, domínios e vulnerabilidades monitoradas.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="cyber-card">
          <h2 className="text-xs uppercase tracking-wide text-gray-400">Aplicações</h2>
          <p className="mt-2 text-3xl font-bold text-primary-light">{data.applications}</p>
        </div>
        <div className="cyber-card">
          <h2 className="text-xs uppercase tracking-wide text-gray-400">Responsáveis</h2>
          <p className="mt-2 text-3xl font-bold text-primary-light">{data.responsibles}</p>
        </div>
        <div className="cyber-card">
          <h2 className="text-xs uppercase tracking-wide text-gray-400">Domínios</h2>
          <p className="mt-2 text-3xl font-bold text-primary-light">{data.domains}</p>
        </div>
        <div className="cyber-card">
          <h2 className="text-xs uppercase tracking-wide text-gray-400">Vulnerabilidades (abertas)</h2>
          <p className="mt-2 text-3xl font-bold text-primary-light">{data.totals.open}</p>
        </div>
      </div>
      <div className="cyber-card">
        <h2 className="text-xl font-display text-primary-light">Severidade por volume</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Object.entries(data.vulnerabilities).map(([severity, total]) => (
            <div key={severity} className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
              <div className="text-xs uppercase text-gray-400">{severity}</div>
              <div className="text-2xl font-bold text-white">{total as number}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
