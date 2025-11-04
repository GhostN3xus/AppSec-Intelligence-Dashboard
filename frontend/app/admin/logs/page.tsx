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
  const [auditFilter, setAuditFilter] = useState('');
  const [loginFilter, setLoginFilter] = useState<'all' | 'success' | 'failure'>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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

  const filteredAuditLogs = auditLogs
    .filter((log) => !auditFilter || log.action.toLowerCase().includes(auditFilter.toLowerCase()) || log.entity.toLowerCase().includes(auditFilter.toLowerCase()))
    .sort((a, b) => sortOrder === 'desc' ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const filteredLoginLogs = loginLogs
    .filter((log) => loginFilter === 'all' || (loginFilter === 'success' && log.success) || (loginFilter === 'failure' && !log.success))
    .sort((a, b) => sortOrder === 'desc' ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display text-primary-light">{t('logs.title')}</h1>
          <p className="text-sm text-gray-400">{t('logs.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            className="rounded border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-white"
          >
            <option value="desc">Mais recentes</option>
            <option value="asc">Mais antigos</option>
          </select>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">{t('logs.auditTitle')}</h2>
          </div>
          <input
            type="text"
            placeholder="Filtrar por ação ou entidade..."
            value={auditFilter}
            onChange={(e) => setAuditFilter(e.target.value)}
            className="mt-3 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
          />
          {loading ? (
            <p className="mt-4 text-sm text-gray-400">{t('home.modules.loading')}</p>
          ) : filteredAuditLogs.length ? (
            <ul className="mt-4 space-y-3 text-sm text-gray-300">
              {filteredAuditLogs.map((log) => (
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
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">{t('logs.loginTitle')}</h2>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setLoginFilter('all')}
              className={`rounded px-3 py-1 text-xs font-medium ${loginFilter === 'all' ? 'bg-primary text-white' : 'border border-slate-700 text-gray-400'}`}
            >
              Todos
            </button>
            <button
              onClick={() => setLoginFilter('success')}
              className={`rounded px-3 py-1 text-xs font-medium ${loginFilter === 'success' ? 'bg-emerald-500 text-white' : 'border border-slate-700 text-gray-400'}`}
            >
              Sucesso
            </button>
            <button
              onClick={() => setLoginFilter('failure')}
              className={`rounded px-3 py-1 text-xs font-medium ${loginFilter === 'failure' ? 'bg-red-500 text-white' : 'border border-slate-700 text-gray-400'}`}
            >
              Falha
            </button>
          </div>
          {loading ? (
            <p className="mt-4 text-sm text-gray-400">{t('home.modules.loading')}</p>
          ) : filteredLoginLogs.length ? (
            <ul className="mt-4 space-y-3 text-sm text-gray-300">
              {filteredLoginLogs.map((log) => (
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
