'use client';

import { useEffect } from 'react';
import { MetricCard } from '../components/cards/metric-card';
import { SeverityChart } from '../components/dashboard/severity-chart';
import { TopApplications } from '../components/dashboard/top-applications';
import { SlaSummary } from '../components/dashboard/sla-summary';
import { useDashboardStore } from '../store/dashboard-store';

export default function DashboardPage() {
  const load = useDashboardStore((state) => state.load);
  const loading = useDashboardStore((state) => state.loading);
  const metrics = useDashboardStore((state) => state.metrics);

  useEffect(() => {
    load();
  }, [load]);

  if (loading || !metrics) {
    return <div className="cyber-card">Carregando métricas...</div>;
  }

  const totalVulns = metrics.vulnerabilities.length;
  const falsePositiveRate = metrics.vulnerabilities.length
    ? Math.round(
        ((metrics.vulnerabilities.filter((v: any) => v.findings?.some((f: any) => f.falsePositive)).length || 0) /
          metrics.vulnerabilities.length) *
          100,
      )
    : 0;

  return (
    <div className="cyber-grid">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <MetricCard title="Vulnerabilidades" value={totalVulns} description="Todos os achados correlacionados" />
        <MetricCard title="SLA Vencido" value={metrics.sla.summary.overdue} description="Itens fora do prazo" />
        <MetricCard
          title="Aplicações monitoradas"
          value={metrics.topApplications.length}
          description="Top 10 por criticidade"
        />
        <MetricCard title="Falsos positivos" value={`${falsePositiveRate}%`} description="Detectados pela IA" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SeverityChart data={metrics.severityCounts} />
        <SlaSummary summary={metrics.sla.summary} />
      </div>
      <TopApplications applications={metrics.topApplications} />
    </div>
  );
}
