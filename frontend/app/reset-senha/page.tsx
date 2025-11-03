'use client';

import { useState } from 'react';
import api from '../../lib/api-client';

export default function ResetSenhaPage() {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');

  const handleReset = async () => {
    setStatus('');
    try {
      await api.post('/auth/reset-password', { token, password });
      setStatus('Senha atualizada com sucesso. Faça login novamente.');
    } catch (error: any) {
      setStatus(error?.response?.data?.message ?? 'Não foi possível redefinir a senha.');
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-5 rounded-2xl border border-slate-800 bg-slate-950/70 p-8 shadow-xl">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-display text-primary-light">Redefinir senha</h1>
        <p className="text-sm text-gray-400">Cole o token recebido por e-mail e informe a nova senha.</p>
      </div>
      <input
        value={token}
        onChange={(event) => setToken(event.target.value)}
        placeholder="Token recebido"
        className="w-full rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-2 text-sm text-white focus:border-primary focus:outline-none"
      />
      <input
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Nova senha"
        className="w-full rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-2 text-sm text-white focus:border-primary focus:outline-none"
      />
      {status ? <div className="text-sm text-emerald-400">{status}</div> : null}
      <button
        onClick={handleReset}
        className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white hover:brightness-110"
      >
        Redefinir senha
      </button>
    </div>
  );
}
