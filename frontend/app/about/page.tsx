'use client';

import { useTranslation } from 'react-i18next';

const milestones = [
  { id: 'docker', date: '2024-01', descriptionPt: 'Stack dockerizada com pipelines Semgrep/SCA', descriptionEn: 'Dockerized stack with Semgrep/SCA pipelines' },
  { id: 'reports', date: '2024-02', descriptionPt: 'Editor de relatórios OWASP/MSTG com exportação PDF/DOCX', descriptionEn: 'OWASP/MSTG report editor with PDF/DOCX export' },
  { id: 'ux', date: '2024-03', descriptionPt: 'Home interativa, breadcrumbs e i18n pt/en', descriptionEn: 'Interactive home, breadcrumbs and pt/en i18n' },
];

export default function AboutPage() {
  const { t, i18n } = useTranslation('common');
  const isPt = i18n.language?.startsWith('pt');

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-display text-primary-light">{t('about.title')}</h1>
        <p className="text-sm text-gray-400">{t('about.subtitle')}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">{t('about.version')}</h2>
          <p className="mt-2 text-2xl font-semibold text-white">v1.3</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">{t('about.credits')}</h2>
          <p className="mt-2 text-sm text-gray-300">{t('about.maintainer')}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Changelog</h2>
          <p className="mt-2 text-sm text-gray-300">{t('about.changelog')}</p>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
        <h2 className="text-lg font-semibold text-white">{t('about.changelog')}</h2>
        <ul className="mt-4 space-y-3 text-sm text-gray-300">
          {milestones.map((item) => (
            <li key={item.id} className="flex items-start gap-3">
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
              <div>
                <div className="text-xs uppercase tracking-wide text-gray-500">{item.date}</div>
                <div>{isPt ? item.descriptionPt : item.descriptionEn}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 text-sm text-gray-300">
        {t('about.thanks')}
      </div>
    </div>
  );
}
