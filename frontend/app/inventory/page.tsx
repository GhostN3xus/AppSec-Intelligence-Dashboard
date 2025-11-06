'use client';

import useSWR from 'swr';
import api from '../../lib/api-client';
import { ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';

const fetcher = (url: string) => api.get(url).then((res) => res.data);

function StatCard({ title, value }) {
  return (
    <div className="bg-slate-900 p-6 rounded-lg text-center">
      <h3 className="text-lg font-semibold text-gray-400">{title}</h3>
      <p className="text-4xl font-bold text-white">{value}</p>
    </div>
  );
}

function InventoryClient() {
  const { data, error } = useSWR('/inventory/summary', fetcher);

  if (error) return <div>Falha ao carregar o inventário.</div>;
  if (!data) return <div>Carregando...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard title="Aplicações" value={data.applications} />
      <StatCard title="Responsáveis" value={data.responsibles} />
      <StatCard title="Domínios" value={data.domains} />
      <StatCard title="Vulnerabilidades Abertas" value={data.totals.open} />
    </div>
  );
}

export default function InventoryPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <ClipboardDocumentCheckIcon className="h-8 w-8 text-primary-light" />
        <h1 className="text-4xl font-display font-bold text-white">
          Inventário de Ativos
        </h1>
      </div>
      <InventoryClient />
    </div>
  );
}
