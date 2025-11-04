'use client';

import { useEffect, useState } from 'react';
import api from '../../lib/api-client';

export default function ResponsaveisPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [creating, setCreating] = useState(false);
  const [newResponsible, setNewResponsible] = useState({ name: '', email: '', department: '' });

  const load = () => {
    setLoading(true);
    api
      .get('/responsibles')
      .then((response) => setItems(response.data ?? []))
      .catch((err) => {
        console.error('Erro ao carregar responsáveis:', err);
        alert('Erro ao carregar responsáveis. Tente novamente.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleExport = () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    window.open(`${baseUrl.replace(/\/$/, '')}/api/responsibles/export/excel`, '_blank');
  };

  const handleCreate = async () => {
    try {
      await api.post('/responsibles', newResponsible);
      setNewResponsible({ name: '', email: '', department: '' });
      setCreating(false);
      load();
    } catch (error) {
      console.error('Erro ao criar:', error);
      alert('Erro ao criar responsável.');
    }
  };

  const handleUpdate = async () => {
    if (!editing) return;
    try {
      await api.patch(`/responsibles/${editing.id}`, {
        name: editing.name,
        email: editing.email,
        department: editing.department,
      });
      setEditing(null);
      load();
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      alert('Erro ao atualizar responsável.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este responsável?')) return;
    try {
      await api.delete(`/responsibles/${id}`);
      load();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      alert('Erro ao excluir responsável.');
    }
  };

  return (
    <div className="cyber-card">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display text-primary-light">Responsáveis</h1>
          <p className="text-sm text-gray-400">Distribuição de responsáveis por aplicação e SLA</p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary" onClick={() => setCreating(true)}>
            Novo Responsável
          </button>
          <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white" onClick={handleExport}>
            Baixar Excel
          </button>
        </div>
      </div>
      {loading ? (
        <p className="mt-4 text-gray-400">Carregando dados...</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase text-gray-500">
              <tr>
                <th className="py-2">Nome</th>
                <th className="py-2">E-mail</th>
                <th className="py-2">Área</th>
                <th className="py-2">Vulnerabilidades</th>
                <th className="py-2">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="py-3 font-medium text-white">{item.name}</td>
                  <td className="py-3 text-gray-300">{item.email}</td>
                  <td className="py-3 text-gray-400">{item.department ?? '-'}</td>
                  <td className="py-3 text-primary-light">{item.vulnerabilities?.length ?? 0}</td>
                  <td className="py-3 space-x-2">
                    <button className="text-blue-400 hover:underline" onClick={() => setEditing(item)}>
                      Editar
                    </button>
                    <button className="text-red-400 hover:underline" onClick={() => handleDelete(item.id)}>
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {creating ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="cyber-card w-full max-w-lg space-y-4">
            <h2 className="text-xl font-display text-primary-light">Novo Responsável</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-400">Nome</label>
                <input
                  type="text"
                  value={newResponsible.name}
                  onChange={(e) => setNewResponsible({ ...newResponsible, name: e.target.value })}
                  className="w-full rounded border border-slate-700 bg-slate-900 p-2 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">E-mail</label>
                <input
                  type="email"
                  value={newResponsible.email}
                  onChange={(e) => setNewResponsible({ ...newResponsible, email: e.target.value })}
                  className="w-full rounded border border-slate-700 bg-slate-900 p-2 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">Departamento</label>
                <input
                  type="text"
                  value={newResponsible.department}
                  onChange={(e) => setNewResponsible({ ...newResponsible, department: e.target.value })}
                  className="w-full rounded border border-slate-700 bg-slate-900 p-2 text-white"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleCreate} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">
                Criar
              </button>
              <button onClick={() => setCreating(false)} className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-gray-400">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {editing ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="cyber-card w-full max-w-lg space-y-4">
            <h2 className="text-xl font-display text-primary-light">Editar Responsável</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-400">Nome</label>
                <input
                  type="text"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="w-full rounded border border-slate-700 bg-slate-900 p-2 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">E-mail</label>
                <input
                  type="email"
                  value={editing.email}
                  onChange={(e) => setEditing({ ...editing, email: e.target.value })}
                  className="w-full rounded border border-slate-700 bg-slate-900 p-2 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">Departamento</label>
                <input
                  type="text"
                  value={editing.department || ''}
                  onChange={(e) => setEditing({ ...editing, department: e.target.value })}
                  className="w-full rounded border border-slate-700 bg-slate-900 p-2 text-white"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleUpdate} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">
                Salvar
              </button>
              <button onClick={() => setEditing(null)} className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-gray-400">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
