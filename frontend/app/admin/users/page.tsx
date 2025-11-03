'use client';

import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../../lib/api-client';

const roles = [
  { value: 'admin', label: 'Administrador' },
  { value: 'analyst', label: 'Analista' },
  { value: 'owner', label: 'Owner' },
  { value: 'auditor', label: 'Auditor' },
];

const statuses = [
  { value: 'active', label: 'Ativo' },
  { value: 'suspended', label: 'Suspenso' },
];

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  title?: string | null;
  language?: string | null;
  lastLogin?: string | null;
  createdAt?: string;
};

type CreateUserForm = {
  name: string;
  email: string;
  password: string;
  role: string;
  status: string;
  title?: string;
  language?: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { register, handleSubmit, reset } = useForm<CreateUserForm>({
    defaultValues: { role: 'analyst', status: 'active', language: 'pt-BR' },
  });

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await api.get('/users');
      setUsers(response.data ?? []);
    } catch (err) {
      setError('Não foi possível carregar usuários.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const response = await api.post('/users', values);
      setUsers((prev) => [response.data, ...prev]);
      setSuccess('Usuário criado com sucesso.');
      reset({ name: '', email: '', password: '', role: 'analyst', status: 'active', language: 'pt-BR', title: '' });
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Falha ao criar usuário.');
    } finally {
      setSubmitting(false);
    }
  });

  const toggleStatus = async (user: User) => {
    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    try {
      const response = await api.patch(`/users/${user.id}`, { status: nextStatus });
      setUsers((prev) => prev.map((item) => (item.id === user.id ? response.data : item)));
    } catch (err) {
      setError('Não foi possível atualizar o status do usuário.');
    }
  };

  const removeUser = async (user: User) => {
    if (!confirm(`Remover usuário ${user.email}?`)) return;
    try {
      await api.delete(`/users/${user.id}`);
      setUsers((prev) => prev.filter((item) => item.id !== user.id));
    } catch (err) {
      setError('Não foi possível remover o usuário.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="cyber-card">
        <h1 className="text-2xl font-display text-primary-light">Administração de usuários</h1>
        <p className="text-sm text-gray-400">Gerencie acessos e permissões do AppSec Dashboard.</p>
        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
          <div className="space-y-2">
            <label className="text-sm text-gray-300">Nome</label>
            <input
              className="w-full rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
              {...register('name', { required: true })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-gray-300">E-mail</label>
            <input
              type="email"
              className="w-full rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
              {...register('email', { required: true })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-gray-300">Senha temporária</label>
            <input
              type="password"
              className="w-full rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
              {...register('password', { required: true, minLength: 6 })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-gray-300">Cargo</label>
            <input
              className="w-full rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
              {...register('title')}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-gray-300">Idioma</label>
            <select
              className="w-full rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
              {...register('language')}
            >
              <option value="pt-BR">Português</option>
              <option value="en-US">English</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-gray-300">Perfil</label>
            <select
              className="w-full rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
              {...register('role')}
            >
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-gray-300">Status</label>
            <select
              className="w-full rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
              {...register('status')}
            >
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
          {error ? <div className="md:col-span-2 rounded bg-red-500/20 p-2 text-sm text-red-200">{error}</div> : null}
          {success ? <div className="md:col-span-2 rounded bg-emerald-500/10 p-2 text-sm text-emerald-300">{success}</div> : null}
          <button
            type="submit"
            disabled={submitting}
            className="md:col-span-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:brightness-110 disabled:opacity-60"
          >
            {submitting ? 'Criando...' : 'Criar usuário'}
          </button>
        </form>
      </div>

      <div className="cyber-card">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-display text-primary-light">Usuários cadastrados</h2>
          <button
            className="rounded border border-slate-700 px-3 py-1 text-xs uppercase tracking-wide text-gray-300 hover:border-primary"
            onClick={loadUsers}
          >
            Recarregar
          </button>
        </div>
        {loading ? (
          <p className="mt-4 text-sm text-gray-400">Carregando usuários...</p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase text-gray-500">
                <tr>
                  <th className="py-2">Nome</th>
                  <th className="py-2">E-mail</th>
                  <th className="py-2">Perfil</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Último acesso</th>
                  <th className="py-2 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="py-3 font-medium text-white">{user.name}</td>
                    <td className="py-3 text-gray-300">{user.email}</td>
                    <td className="py-3 text-gray-300">{user.role}</td>
                    <td className="py-3">
                      <span
                        className={
                          user.status === 'active'
                            ? 'rounded-full bg-emerald-500/20 px-3 py-1 text-xs uppercase text-emerald-300'
                            : 'rounded-full bg-yellow-500/10 px-3 py-1 text-xs uppercase text-yellow-300'
                        }
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-400">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Nunca'}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          className="rounded border border-slate-700 px-3 py-1 text-xs uppercase tracking-wide text-gray-300 hover:border-primary"
                          onClick={() => toggleStatus(user)}
                        >
                          {user.status === 'active' ? 'Suspender' : 'Reativar'}
                        </button>
                        <button
                          className="rounded border border-red-500/40 px-3 py-1 text-xs uppercase tracking-wide text-red-300 hover:border-red-500"
                          onClick={() => removeUser(user)}
                        >
                          Remover
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 ? (
                  <tr>
                    <td className="py-6 text-center text-sm text-gray-500" colSpan={6}>
                      Nenhum usuário cadastrado.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
