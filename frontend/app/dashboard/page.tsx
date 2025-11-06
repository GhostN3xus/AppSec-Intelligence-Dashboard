'use client';

import DashboardClient from '../../components/dashboard/DashboardClient';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-16">
      <section className="space-y-4 pt-8">
        <div className="flex items-center gap-3">
          <ShieldCheckIcon className="h-8 w-8 text-primary-light" />
          <h1 className="text-4xl font-display font-bold text-white">
            Dashboard de Segurança
          </h1>
        </div>
        <p className="text-lg text-gray-400">
          Métricas e visualizações em tempo real.
        </p>
      </section>
      <DashboardClient />
    </div>
  );
}
