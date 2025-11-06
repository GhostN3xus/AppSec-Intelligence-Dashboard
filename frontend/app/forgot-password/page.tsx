'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import api from '../../lib/api-client';
import Link from 'next/link';

type ForgotPasswordForm = {
  email: string;
};

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { register, handleSubmit } = useForm<ForgotPasswordForm>();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/auth/forgot-password', values);
      setSuccess('Se um usuário com este e-mail existir, um link para redefinir a senha será enviado.');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Não foi possível solicitar a redefinição de senha.');
    } finally {
      setLoading(false);
    }
  });

  return (
    <div className="mx-auto max-w-md space-y-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-8 shadow-xl">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-display text-primary-light">Redefinir Senha</h1>
        <p className="text-sm text-gray-400">Informe seu e-mail corporativo para receber um link de redefinição.</p>
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
        {error ? <div className="rounded bg-red-500/20 p-2 text-sm text-red-300">{error}</div> : null}
        {success ? <div className="rounded bg-green-500/20 p-2 text-sm text-green-300">{success}</div> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:brightness-110 disabled:opacity-60"
        >
          {loading ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
      <div className="text-center text-xs text-gray-400">
        <Link href="/login" className="hover:text-primary">
          Voltar para o login
        </Link>
      </div>
    </div>
  );
}
