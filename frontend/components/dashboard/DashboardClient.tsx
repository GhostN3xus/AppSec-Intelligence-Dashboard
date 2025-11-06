'use client';

import useSWR from 'swr';
import api from '../../lib/api-client';
import SeverityChart from './SeverityChart';
import SlaChart from './SlaChart';

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function DashboardClient() {
  const { data: slaSummary, error: slaError } = useSWR('/vulnerabilities/sla/summary', fetcher);
  const { data: slaDashboard, error: slaDashboardError } = useSWR('/sla/dashboard', fetcher);

  if (slaError || slaDashboardError) return <div>Falha ao carregar os dados.</div>;
  if (!slaSummary || !slaDashboard) return <div>Carregando...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-slate-900 p-6 rounded-lg">
        <SeverityChart data={slaSummary.bySeverity} />
      </div>
      <div className="bg-slate-900 p-6 rounded-lg">
        <SlaChart data={slaDashboard} />
      </div>
    </div>
  );
}
