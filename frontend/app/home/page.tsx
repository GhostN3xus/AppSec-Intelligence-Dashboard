'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import api from '../../lib/api-client';
import { useTranslation } from 'react-i18next';

interface ModuleStatus {
  id: string;
  label: string;
  status: 'operational' | 'pending';
  totalFindings: number;
  lastActivity?: string | null;
}

export default function HomePage() {
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState<ModuleStatus[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await api.get('/health/modules');
        if (!active) return;
        setModules(response.data.modules);
      } catch (error) {
        if (active) {
          setModules([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const cards = useMemo(
    () => [
      {
        key: 'howToUse',
        href: '/docs/instalacao',
        accent: 'from-blue-500/30 to-blue-600/10',
      },
      {
        key: 'importSast',
        href: '/sast',
        accent: 'from-emerald-500/30 to-emerald-600/10',
      },
      {
        key: 'reports',
        href: '/templates',
        accent: 'from-purple-500/30 to-purple-600/10',
      },
      {
        key: 'manageApps',
        href: '/applications',
        accent: 'from-cyan-500/30 to-cyan-600/10',
      },
    ],
    [],
  );

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-4">
          <h1 className="text-3xl font-display text-primary-light">{t('home.title')}</h1>
          <p className="mt-2 text-sm text-gray-400">{t('home.subtitle')}</p>
        </div>
        {cards.map((card) => (
          <Link
            key={card.key}
            href={card.href}
            className={`group rounded-2xl border border-slate-800 bg-gradient-to-br ${card.accent} p-5 transition hover:border-primary/70 hover:shadow-lg hover:shadow-primary/10`}
          >
            <div className="flex h-full flex-col justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">{t(`home.cards.${card.key}.title` as const)}</h2>
                <p className="mt-2 text-sm text-slate-300/80">{t(`home.cards.${card.key}.description` as const)}</p>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-primary-light">
                {t(`home.cards.${card.key}.action` as const)}
                <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-display text-primary-light">{t('home.modules.title')}</h2>
            <p className="text-sm text-gray-400">{t('home.modules.subtitle')}</p>
          </div>
          <div className="flex gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              {t('home.modules.operational')}
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              {t('home.modules.pending')}
            </span>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {loading ? (
            <div className="md:col-span-3 text-sm text-gray-400">{t('home.modules.loading')}</div>
          ) : modules.length ? (
            modules.map((module) => {
              const labelKey =
                module.id === 'sast'
                  ? 'navigation.sast'
                  : module.id === 'sca'
                    ? 'navigation.sca'
                    : module.id === 'reports'
                      ? 'navigation.reports'
                      : `navigation.${module.id}`;
              const translatedLabel = t(labelKey as any, { defaultValue: module.label });
              return (
                <div key={module.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-inner">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{translatedLabel}</h3>
                      <p className="text-xs text-gray-500">{t('home.modules.totalFindings')}: {module.totalFindings}</p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        module.status === 'operational'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-200'
                      }`}
                    >
                      {module.status === 'operational'
                        ? t('home.modules.operational')
                        : t('home.modules.pending')}
                    </span>
                  </div>
                  <div className="mt-4 text-xs text-gray-400">
                    {t('home.modules.lastUpdate')}: {module.lastActivity ? new Date(module.lastActivity).toLocaleString() : '—'}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="md:col-span-3 text-sm text-gray-400">{t('logs.empty')}</div>
          )}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Link
          href="/login"
          className="rounded-xl border border-slate-800 bg-slate-950/50 p-5 transition hover:border-primary/70"
        >
          <h3 className="text-lg font-semibold text-white">{t('home.shortcuts.login')}</h3>
          <p className="mt-2 text-sm text-gray-400">{t('actions.goToLogin')}</p>
        </Link>
        <Link
          href="/docs"
          className="rounded-xl border border-slate-800 bg-slate-950/50 p-5 transition hover:border-primary/70"
        >
          <h3 className="text-lg font-semibold text-white">{t('home.shortcuts.documentation')}</h3>
          <p className="mt-2 text-sm text-gray-400">{t('actions.viewDocs')}</p>
        </Link>
      </section>
    </div>
  );
}
