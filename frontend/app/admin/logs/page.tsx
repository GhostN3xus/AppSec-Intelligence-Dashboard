'use client';

import { useEffect, useState } from 'react';
import api from '../../../lib/api-client';
import { useTranslation } from 'react-i18next';

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  createdAt: string;
  actor?: { name: string | null };
  meta?: Record<string, any> | null;
}

interface LoginLog {
  id: string;
  email: string;
  success: boolean;
  createdAt: string;
  ip?: string | null;
  user?: { name: string | null } | null;
}

export default function AdminLogsPage() {
  const { t } = useTranslation('common');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [auditResponse, loginResponse] = await Promise.all([
          api.get('/audit'),
          api.get('/audit/logins'),
        ]);
        if (!active) return;
        setAuditLogs(auditResponse.data ?? []);
        setLoginLogs(loginResponse.data ?? []);
      } catch (error) {
        if (!active) return;
        setAuditLogs([]);
        setLoginLogs([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display text-primary-light">{t('logs.title')}</h1>
        <p className="text-sm text-gray-400">{t('logs.subtitle')}</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
          <h2 className="text-lg font-semibold text-white">{t('logs.auditTitle')}</h2>
          {loading ? (
            <p className="mt-4 text-sm text-gray-400">{t('home.modules.loading')}</p>
          ) : auditLogs.length ? (
            <ul className="mt-4 space-y-3 text-sm text-gray-300">
              {auditLogs.map((log) => (
                <li key={log.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{new Date(log.createdAt).toLocaleString()}</span>
                    <span>{log.actor?.name ?? t('logs.system')}</span>
                  </div>
                  <div className="mt-2 font-semibold text-primary-light">{log.action}</div>
                  <div className="text-xs uppercase tracking-wide text-gray-500">{log.entity}</div>
                  {log.meta ? (
                    <pre className="mt-3 overflow-auto rounded-lg bg-slate-950/70 p-3 text-xs text-gray-400">
                      {JSON.stringify(log.meta, null, 2)}
                    </pre>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-gray-400">{t('logs.empty')}</p>
          )}
        </section>
        <section className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
          <h2 className="text-lg font-semibold text-white">{t('logs.loginTitle')}</h2>
          {loading ? (
            <p className="mt-4 text-sm text-gray-400">{t('home.modules.loading')}</p>
          ) : loginLogs.length ? (
            <ul className="mt-4 space-y-3 text-sm text-gray-300">
              {loginLogs.map((log) => (
                <li key={log.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{new Date(log.createdAt).toLocaleString()}</span>
                    <span>{log.user?.name ?? log.email}</span>
                  </div>
                  <div className="mt-2 font-semibold text-primary-light">
                    {log.success ? t('logs.success') : t('logs.failure')}
                  </div>
                  {log.ip ? <div className="text-xs text-gray-500">IP: {log.ip}</div> : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-gray-400">{t('logs.empty')}</p>
          )}
        </section>
      </div>
    </div>
  );
}
