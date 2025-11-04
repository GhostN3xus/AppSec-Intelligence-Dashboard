'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../lib/api-client';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

type Application = {
  id: string;
  name: string;
  stack?: string | null;
  repository?: string | null;
  responsibleId?: string | null;
  responsible?: { id: string; name: string } | null;
  status?: string;
  description?: string | null;
};

type Responsible = {
  id: string;
  name: string;
  email: string;
};

type ApplicationForm = {
  name: string;
  stack?: string;
  repository?: string;
  responsibleId?: string;
  status?: string;
  description?: string;
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [responsibles, setResponsibles] = useState<Responsible[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { register, handleSubmit, reset, setValue } = useForm<ApplicationForm>({
    defaultValues: { status: 'active' },
  });

  const loadApplications = async () => {
    setLoading(true);
    try {
      const response = await api.get('/applications');
      setApplications(response.data ?? []);
    } catch (err) {
      setError('Erro ao carregar aplicações');
    } finally {
      setLoading(false);
    }
  };

  const loadResponsibles = async () => {
    try {
      const response = await api.get('/responsibles');
      setResponsibles(response.data ?? []);
    } catch (err) {
      console.error('Erro ao carregar responsáveis');
    }
  };

  useEffect(() => {
    loadApplications();
    loadResponsibles();
  }, []);

  const onSubmit = handleSubmit(async (data) => {
    setError('');
    setSuccess('');
    try {
      if (editingId) {
        const response = await api.patch(`/applications/${editingId}`, data);
        setApplications((prev) => prev.map((app) => (app.id === editingId ? response.data : app)));
        setSuccess('Aplicação atualizada com sucesso!');
      } else {
        const response = await api.post('/applications', data);
        setApplications((prev) => [response.data, ...prev]);
        setSuccess('Aplicação criada com sucesso!');
      }
      resetForm();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erro ao salvar aplicação');
    }
  });

  const handleEdit = (app: Application) => {
    setEditingId(app.id);
    setShowForm(true);
    setValue('name', app.name);
    setValue('stack', app.stack || '');
    setValue('repository', app.repository || '');
    setValue('responsibleId', app.responsibleId || '');
    setValue('status', app.status || 'active');
    setValue('description', app.description || '');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta aplicação?')) return;
    try {
      await api.delete(`/applications/${id}`);
      setApplications((prev) => prev.filter((app) => app.id !== id));
      setSuccess('Aplicação excluída com sucesso!');
    } catch (err) {
      setError('Erro ao excluir aplicação');
    }
  };

  const resetForm = () => {
    reset({ name: '', stack: '', repository: '', responsibleId: '', status: 'active', description: '' });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display text-primary-light">Aplicações</h1>
          <p className="text-sm text-gray-400">Gestão de inventário e responsáveis por aplicação</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
        >
          <PlusIcon className="h-5 w-5" />
          {showForm ? 'Cancelar' : 'Nova Aplicação'}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm text-green-200">
          {success}
        </div>
      )}

      {showForm && (
        <div className="cyber-card">
          <h2 className="text-xl font-display text-primary-light mb-4">
            {editingId ? 'Editar Aplicação' : 'Nova Aplicação'}
          </h2>
          <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-gray-300">Nome *</label>
              <input
                {...register('name', { required: true })}
                className="w-full rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                placeholder="Nome da aplicação"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-300">Stack</label>
              <input
                {...register('stack')}
                className="w-full rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                placeholder="Ex: Node.js, Python, Java"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-300">Repositório</label>
              <input
                {...register('repository')}
                className="w-full rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                placeholder="URL do repositório Git"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-300">Responsável</label>
              <select
                {...register('responsibleId')}
                className="w-full rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
              >
                <option value="">Selecione um responsável</option>
                {responsibles.map((resp) => (
                  <option key={resp.id} value={resp.id}>
                    {resp.name} ({resp.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-300">Status</label>
              <select
                {...register('status')}
                className="w-full rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
              >
                <option value="active">Ativa</option>
                <option value="inactive">Inativa</option>
                <option value="deprecated">Descontinuada</option>
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm text-gray-300">Descrição</label>
              <textarea
                {...register('description')}
                className="w-full rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                placeholder="Descrição da aplicação"
                rows={3}
              />
            </div>

            <div className="flex gap-3 md:col-span-2">
              <button
                type="submit"
                className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-white hover:brightness-110"
              >
                {editingId ? 'Atualizar' : 'Criar'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-slate-700 px-6 py-2 text-sm font-medium text-gray-300 hover:border-primary"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="cyber-card">
        {loading ? (
          <p className="mt-4 text-gray-400">Carregando aplicações...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase text-gray-500">
                <tr>
                  <th className="py-2">Nome</th>
                  <th className="py-2">Stack</th>
                  <th className="py-2">Repositório</th>
                  <th className="py-2">Responsável</th>
                  <th className="py-2">Status</th>
                  <th className="py-2 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      Nenhuma aplicação cadastrada
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => (
                    <tr key={app.id}>
                      <td className="py-3 font-medium text-white">{app.name}</td>
                      <td className="py-3 text-gray-400">{app.stack ?? '-'}</td>
                      <td className="py-3 text-primary-light">
                        {app.repository ? (
                          <a href={app.repository} target="_blank" rel="noreferrer" className="hover:underline">
                            {app.repository.length > 40 ? `${app.repository.substring(0, 40)}...` : app.repository}
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-3 text-gray-300">{app.responsible?.name ?? 'Não definido'}</td>
                      <td className="py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs uppercase ${
                            app.status === 'active'
                              ? 'bg-green-500/20 text-green-300'
                              : app.status === 'deprecated'
                              ? 'bg-red-500/20 text-red-300'
                              : 'bg-gray-500/20 text-gray-300'
                          }`}
                        >
                          {app.status ?? 'active'}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(app)}
                            className="rounded border border-slate-700 p-2 text-gray-300 hover:border-primary hover:text-primary"
                            title="Editar"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(app.id)}
                            className="rounded border border-red-500/40 p-2 text-red-300 hover:border-red-500"
                            title="Excluir"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
