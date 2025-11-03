'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import api from '../../lib/api-client';
import { useAuthStore } from '../../store/auth-store';

type LoginForm = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();
  const { register, handleSubmit } = useForm<LoginForm>();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const setUser = useAuthStore((state) => state.setUser);

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/login', values);
      setUser(response.data.user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Falha ao autenticar.');
    } finally {
      setLoading(false);
    }
  });

  return (
    <div className="mx-auto max-w-md space-y-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-8 shadow-xl">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-display text-primary-light">Acessar painel AppSec</h1>
        <p className="text-sm text-gray-400">Informe suas credenciais corporativas para entrar.</p>
      </div>
      <form className="space-y-4" onSubmit={onSubmit}>
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
            Senha
          </label>
          <input
            id="password"
            type="password"
            {...register('password', { required: true })}
            className="w-full rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-2 text-sm text-white focus:border-primary focus:outline-none"
          />
        </div>
        {error ? <div className="rounded bg-red-500/20 p-2 text-sm text-red-300">{error}</div> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:brightness-110 disabled:opacity-60"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
      <div className="flex items-center justify-between text-xs text-gray-400">
        <button className="hover:text-primary" onClick={() => router.push('/register')}>
          Criar conta
        </button>
        <button
          className="hover:text-primary"
          onClick={async () => {
            const email = prompt('Informe seu e-mail corporativo para redefinir a senha:');
            if (!email) return;
            try {
              const response = await api.post('/auth/forgot-password', { email });
              alert(`Solicitação enviada. Token: ${response.data.resetToken ?? 'verifique seu e-mail institucional.'}`);
              router.push('/reset-senha');
            } catch (err: any) {
              alert(err?.response?.data?.message ?? 'Não foi possível solicitar redefinição.');
            }
          }}
        >
          Esqueci minha senha
        </button>
      </div>
    </div>
  );
}
