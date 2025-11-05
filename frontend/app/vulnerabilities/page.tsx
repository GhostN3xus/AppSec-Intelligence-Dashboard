'use client';

import { useEffect, useState } from 'react';
import api from '../../lib/api-client';

export default function VulnerabilitiesPage() {
  const [vulns, setVulns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);
  const [summary, setSummary] = useState<string>('');
  const [triage, setTriage] = useState<any[]>([]);
  const [editingVuln, setEditingVuln] = useState<any | null>(null);

  const loadVulns = () => {
    setLoading(true);
    api
      .get('/vulnerabilities')
      .then((response) => setVulns(response.data ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadVulns();
  }, []);

  const handleSummarize = async (vuln: any) => {
    setSelected(vuln);
    const response = await api.post('/ai/summary', {
      title: vuln.title,
      description: vuln.description,
      impact: `Severidade ${vuln.severity}`,
      remediation: 'Consultar recomendações no painel de documentação.',
    });
    setSummary(response.data);
  };

  const handleTriage = async () => {
    const response = await api.post('/ai/triage', {
      findings: vulns.map((v) => ({ id: v.id, title: v.title, severity: v.severity, description: v.description })),
    });
    setTriage(response.data);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta vulnerabilidade?')) return;
    try {
      await api.delete(`/vulnerabilities/${id}`);
      loadVulns();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      alert('Erro ao excluir vulnerabilidade.');
    }
  };

  const handleUpdate = async () => {
    if (!editingVuln) return;
    try {
      await api.patch(`/vulnerabilities/${editingVuln.id}`, {
        title: editingVuln.title,
        description: editingVuln.description,
        severity: editingVuln.severity,
        status: editingVuln.status,
      });
      setEditingVuln(null);
      loadVulns();
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      alert('Erro ao atualizar vulnerabilidade.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display text-primary-light">Vulnerabilidades</h1>
        <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white" onClick={handleTriage}>
          Triagem Automática (IA)
        </button>
      </div>
      <div className="cyber-card">
        {loading ? (
          <p className="text-gray-400">Carregando vulnerabilidades...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase text-gray-500">
                <tr>
                  <th className="py-2">Título</th>
                  <th className="py-2">Severidade</th>
                  <th className="py-2">Aplicação</th>
                  <th className="py-2">Responsável</th>
                  <th className="py-2">SLA</th>
                  <th className="py-2">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {vulns.map((vuln) => (
                  <tr key={vuln.id}>
                    <td className="py-3 font-medium text-white">{vuln.title}</td>
                    <td className="py-3 text-gray-300">{vuln.severity}</td>
                    <td className="py-3 text-gray-400">{vuln.application?.name ?? 'N/A'}</td>
                    <td className="py-3 text-gray-400">{vuln.responsible?.name ?? 'N/A'}</td>
                    <td className="py-3 text-gray-400">{new Date(vuln.dueDate).toLocaleDateString()}</td>
                    <td className="py-3 space-x-2">
                      <button className="text-primary-light hover:underline" onClick={() => handleSummarize(vuln)}>
                        Resumo IA
                      </button>
                      <button className="text-blue-400 hover:underline" onClick={() => setEditingVuln(vuln)}>
                        Editar
                      </button>
                      <button className="text-red-400 hover:underline" onClick={() => handleDelete(vuln.id)}>
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {selected ? (
        <div className="cyber-card">
          <h2 className="text-xl font-display text-primary-light">Resumo IA - {selected.title}</h2>
          <p className="mt-2 whitespace-pre-line text-gray-300">{summary}</p>
        </div>
      ) : null}
      {triage.length ? (
        <div className="cyber-card">
          <h2 className="text-xl font-display text-primary-light">Prioridade de Triagem</h2>
          <ul className="mt-3 space-y-2 text-sm text-gray-300">
            {triage.map((item) => (
              <li key={item.id} className="rounded border border-slate-800 p-3">
                <div className="font-medium text-white">{item.id}</div>
                <div className="text-primary-light">{item.classification}</div>
                <div className="text-gray-400">{item.rationale}</div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {editingVuln ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="cyber-card w-full max-w-2xl space-y-4">
            <h2 className="text-xl font-display text-primary-light">Editar Vulnerabilidade</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-400">Título</label>
                <input
                  type="text"
                  value={editingVuln.title}
                  onChange={(e) => setEditingVuln({ ...editingVuln, title: e.target.value })}
                  className="w-full rounded border border-slate-700 bg-slate-900 p-2 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">Descrição</label>
                <textarea
                  value={editingVuln.description || ''}
                  onChange={(e) => setEditingVuln({ ...editingVuln, description: e.target.value })}
                  className="w-full rounded border border-slate-700 bg-slate-900 p-2 text-white"
                  rows={4}
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">Severidade</label>
                <select
                  value={editingVuln.severity}
                  onChange={(e) => setEditingVuln({ ...editingVuln, severity: e.target.value })}
                  className="w-full rounded border border-slate-700 bg-slate-900 p-2 text-white"
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400">Status</label>
                <select
                  value={editingVuln.status}
                  onChange={(e) => setEditingVuln({ ...editingVuln, status: e.target.value })}
                  className="w-full rounded border border-slate-700 bg-slate-900 p-2 text-white"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="false_positive">False Positive</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleUpdate} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">
                Salvar
              </button>
              <button onClick={() => setEditingVuln(null)} className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-gray-400">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
