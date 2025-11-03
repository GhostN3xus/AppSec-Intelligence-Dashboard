'use client';

import { useEffect, useState } from 'react';
import api from '../../lib/api-client';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/applications')
      .then((response) => setApplications(response.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="cyber-card">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display text-primary-light">Aplicações</h1>
        <span className="text-sm text-gray-400">Gestão de inventário e responsáveis</span>
      </div>
      {loading ? (
        <p className="mt-4 text-gray-400">Carregando aplicações...</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase text-gray-500">
              <tr>
                <th className="py-2">Nome</th>
                <th className="py-2">Stack</th>
                <th className="py-2">Repositório</th>
                <th className="py-2">Responsável</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {applications.map((app) => (
                <tr key={app.id}>
                  <td className="py-3 font-medium text-white">{app.name}</td>
                  <td className="py-3 text-gray-400">{app.stack ?? '-'}</td>
                  <td className="py-3 text-primary-light">
                    {app.repository ? (
                      <a href={app.repository} target="_blank" rel="noreferrer">
                        {app.repository}
                      </a>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="py-3 text-gray-300">{app.responsible?.name ?? 'Não definido'}</td>
                  <td className="py-3">
                    <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase text-gray-300">{app.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
