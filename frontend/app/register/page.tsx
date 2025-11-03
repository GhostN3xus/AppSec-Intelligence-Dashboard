'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import api from '../../lib/api-client';
import { useAuthStore } from '../../store/auth-store';

const roles = [
  { value: 'analyst', label: 'Analista AppSec' },
  { value: 'admin', label: 'Administrador' },
  { value: 'owner', label: 'Responsável Técnico' },
  { value: 'auditor', label: 'Auditor' },
];

type RegisterForm = {
  name: string;
  email: string;
  password: string;
  role: string;
  language: string;
  title: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const { register, handleSubmit } = useForm<RegisterForm>({
    defaultValues: { language: 'pt-BR', role: 'analyst' },
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setUser = useAuthStore((state) => state.setUser);

  const onSubmit = handleSubmit(async (values) => {
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/register', values);
      setUser(response.data.user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Não foi possível registrar.');
    } finally {
      setLoading(false);
    }
  });

  return (
    <div className="mx-auto max-w-xl space-y-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-8 shadow-2xl">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-display text-primary-light">Criar nova conta</h1>
        <p className="text-sm text-gray-400">Convide novos integrantes da equipe AppSec e defina o perfil de acesso.</p>
      </div>
      <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-medium text-gray-200" htmlFor="name">
            Nome completo
          </label>
          <input
            id="name"
            {...register('name', { required: true })}
            className="w-full rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-2 text-sm text-white focus:border-primary focus:outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-200" htmlFor="email">
            E-mail corporativo
          </label>
          <input
            id="email"
            type="email"
            {...register('email', { required: true })}
            className="w-full rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-2 text-sm text-white focus:border-primary focus:outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-200" htmlFor="password">
            Senha temporária
          </label>
          <input
            id="password"
            type="password"
            {...register('password', { required: true, minLength: 6 })}
            className="w-full rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-2 text-sm text-white focus:border-primary focus:outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-200" htmlFor="title">
            Cargo
          </label>
          <input
            id="title"
            {...register('title')}
            className="w-full rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-2 text-sm text-white focus:border-primary focus:outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-200" htmlFor="language">
            Idioma preferencial
          </label>
          <select
            id="language"
            {...register('language')}
            className="w-full rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-2 text-sm text-white focus:border-primary focus:outline-none"
          >
            <option value="pt-BR">Português (Brasil)</option>
            <option value="en-US">English (US)</option>
          </select>
        </div>
        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-medium text-gray-200" htmlFor="role">
            Perfil de acesso
          </label>
          <div className="grid gap-2 md:grid-cols-2">
            {roles.map((role) => (
              <label
                key={role.value}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-2 text-sm text-gray-300 hover:border-primary"
              >
                <input type="radio" value={role.value} {...register('role')} className="accent-primary" />
                <span>{role.label}</span>
              </label>
            ))}
          </div>
        </div>
        {error ? <div className="md:col-span-2 rounded bg-red-500/20 p-2 text-sm text-red-300">{error}</div> : null}
        <button
          type="submit"
          disabled={loading}
          className="md:col-span-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:brightness-110 disabled:opacity-60"
        >
          {loading ? 'Registrando...' : 'Registrar usuário'}
        </button>
      </form>
      <div className="text-center text-xs text-gray-500">
        Já possui acesso?{' '}
        <button className="text-primary hover:underline" onClick={() => router.push('/login')}>
          Faça login
        </button>
      </div>
    </div>
  );
}
