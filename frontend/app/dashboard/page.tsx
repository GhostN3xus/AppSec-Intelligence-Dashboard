'use client';

import { ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-16">
      <section className="text-center space-y-4 pt-8">
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/10 border border-primary/30">
          <ShieldCheckIcon className="h-5 w-5 text-primary-light" />
          <span className="text-sm font-medium text-primary-light">AppSec Intelligence Dashboard</span>
        </div>
        <h1 className="text-5xl font-display font-bold text-white">
          Dashboard de Segurança de Aplicações
        </h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          Métricas e visualizações em tempo real.
        </p>
      </section>
    </div>
  );
}
