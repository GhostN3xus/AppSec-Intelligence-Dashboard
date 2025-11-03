'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/auth-store';
import api from '../../lib/api-client';

export default function PerfilPage() {
  const { user, setUser, hydrate } = useAuthStore();
  const [status, setStatus] = useState('');
  const [form, setForm] = useState({
    name: '',
    title: '',
    language: 'pt-BR',
    role: 'analyst',
  });

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name,
        title: user.title ?? '',
        language: user.language ?? 'pt-BR',
        role: user.role,
      });
    }
  }, [user]);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setStatus('');
    try {
      const response = await api.put('/auth/me', form);
      setUser(response.data);
      setStatus('Perfil atualizado com sucesso.');
    } catch (error: any) {
      setStatus(error?.response?.data?.message ?? 'Falha ao atualizar.');
    }
  };

  if (!user) {
    return <div className="cyber-card text-gray-400">Carregando perfil...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-display text-primary-light">Perfil do Usuário</h1>
        <p className="text-sm text-gray-400">Atualize idioma, cargo e permissões do seu perfil.</p>
      </div>
      <div className="cyber-card space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-200" htmlFor="name">
            Nome
          </label>
          <input
            id="name"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-2 text-sm text-white focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-200" htmlFor="title">
            Cargo
          </label>
          <input
            id="title"
            value={form.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-2 text-sm text-white focus:border-primary focus:outline-none"
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-gray-200" htmlFor="language">
              Idioma
            </label>
            <select
              id="language"
              value={form.language}
              onChange={(e) => handleChange('language', e.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-2 text-sm text-white focus:border-primary focus:outline-none"
            >
              <option value="pt-BR">Português (Brasil)</option>
              <option value="en-US">English (US)</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-200" htmlFor="role">
              Perfil de acesso
            </label>
            <select
              id="role"
              value={form.role}
              onChange={(e) => handleChange('role', e.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-2 text-sm text-white focus:border-primary focus:outline-none"
            >
              <option value="admin">Administrador</option>
              <option value="analyst">Analista</option>
              <option value="owner">Responsável</option>
              <option value="auditor">Auditor</option>
            </select>
          </div>
        </div>
        {status ? <div className="text-sm text-emerald-400">{status}</div> : null}
        <button
          onClick={handleSave}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white hover:brightness-110"
        >
          Salvar alterações
        </button>
      </div>
      <div className="cyber-card">
        <h2 className="text-xl font-display text-primary-light">Último login</h2>
        <p className="text-sm text-gray-400">
          {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Ainda não registrado.'}
        </p>
      </div>
    </div>
  );
}
