'use client';

import { create } from 'zustand';
import api from '../lib/api-client';

interface DashboardState {
  loading: boolean;
  metrics: any;
  load: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  loading: false,
  metrics: null,
  load: async () => {
    set({ loading: true });
    try {
      const [vulns, sla, apps] = await Promise.all([
        api.get('/vulnerabilities'),
        api.get('/sla/dashboard'),
        api.get('/applications/top-critical?limit=10'),
      ]);
      const severityCounts = (vulns.data ?? []).reduce(
        (acc: Record<string, number>, vuln: any) => {
          acc[vuln.severity] = (acc[vuln.severity] ?? 0) + 1;
          return acc;
        },
        {}
      );
      set({
        metrics: {
          vulnerabilities: vulns.data,
          severityCounts,
          sla: sla.data,
          topApplications: apps.data,
        },
      });
    } catch (error) {
      console.error('Falha ao carregar dashboard', error);
      set({
        metrics: {
          vulnerabilities: [],
          severityCounts: {},
          sla: { summary: { overdue: 0, atRisk: 0, onTrack: 0 }, config: {} },
          topApplications: [],
        },
      });
    } finally {
      set({ loading: false });
    }
  },
}));
