'use client';

import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ShieldCheckIcon, EnvelopeIcon, LockClosedIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import api from '../../lib/api-client';
import { useAuthStore } from '../../store/auth-store';

type LoginForm = {
  email: string;
  password: string;
};

/**
 * LoginPage - Enterprise-grade authentication page
 *
 * Features:
 * - Form validation with react-hook-form
 * - Error handling with user-friendly messages
 * - Loading states and disabled buttons
 * - Redirect to original destination after login
 * - Clean UI without sidebar/topbar (uses LayoutWrapper)
 */
export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginForm>();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const setUser = useAuthStore((state) => state.setUser);

  // Get redirect path from URL params (set by middleware)
  const redirectTo = searchParams?.get('redirect') || '/dashboard';

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', values);

      // Set user in global state
      setUser(response.data.user);

      // Redirect to original destination or dashboard
      router.push(redirectTo);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message;

      // User-friendly error messages
      if (errorMessage?.includes('Credenciais inválidas') || errorMessage?.includes('Invalid credentials')) {
        setError('E-mail ou senha incorretos. Verifique suas credenciais.');
      } else if (errorMessage?.includes('suspended')) {
        setError('Conta suspensa. Entre em contato com o administrador.');
      } else if (errorMessage?.includes('too many requests')) {
        setError('Muitas tentativas de login. Aguarde alguns minutos.');
      } else {
        setError(errorMessage || 'Erro ao fazer login. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  });

  const handleForgotPassword = async () => {
    const email = prompt('Informe seu e-mail corporativo para redefinir a senha:');
    if (!email) return;

    try {
      setLoading(true);
      const response = await api.post('/auth/forgot-password', { email });
      alert(
        `Solicitação enviada com sucesso!\n\n` +
        `Token: ${response.data.resetToken || 'Verifique seu e-mail institucional.'}\n\n` +
        `Você será redirecionado para a página de redefinição de senha.`
      );
      router.push('/reset-senha');
    } catch (err: any) {
      alert(
        err?.response?.data?.message ||
        'Não foi possível solicitar a redefinição. Verifique o e-mail e tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="rounded-full bg-primary/10 p-4 backdrop-blur-sm border border-primary/20">
            <ShieldCheckIcon className="h-12 w-12 text-primary" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-display font-bold text-white tracking-tight">
            AppSec Intelligence
          </h1>
          <p className="text-gray-400">
            Faça login para acessar o painel de segurança
          </p>
        </div>
      </div>

      {/* Login Form Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-8 shadow-2xl backdrop-blur-sm">
        <form className="space-y-6" onSubmit={onSubmit}>
          {/* Email Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200" htmlFor="email">
              E-mail corporativo
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <EnvelopeIcon className="h-5 w-5 text-gray-500" />
              </div>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email', {
                  required: 'E-mail é obrigatório',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'E-mail inválido'
                  }
                })}
                className={`w-full rounded-lg border ${
                  errors.email ? 'border-red-500' : 'border-slate-800'
                } bg-slate-900/70 pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all`}
                placeholder="seu.email@empresa.com"
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <ExclamationCircleIcon className="h-4 w-4" />
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-200" htmlFor="password">
                Senha
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs text-primary hover:text-primary-light transition-colors"
              >
                Esqueceu a senha?
              </button>
            </div>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <LockClosedIcon className="h-5 w-5 text-gray-500" />
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register('password', {
                  required: 'Senha é obrigatória',
                  minLength: {
                    value: 3,
                    message: 'Senha muito curta'
                  }
                })}
                className={`w-full rounded-lg border ${
                  errors.password ? 'border-red-500' : 'border-slate-800'
                } bg-slate-900/70 pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all`}
                placeholder="••••••••"
              />
            </div>
            {errors.password && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <ExclamationCircleIcon className="h-4 w-4" />
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
              <div className="flex items-start gap-3">
                <ExclamationCircleIcon className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-300">Erro ao fazer login</p>
                  <p className="text-xs text-red-400 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-light hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Entrando...
              </span>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-slate-950/70 px-2 text-gray-500">ou</span>
          </div>
        </div>

        {/* Register Link */}
        <div className="text-center">
          <p className="text-sm text-gray-400">
            Não tem uma conta?{' '}
            <button
              type="button"
              onClick={() => router.push('/register')}
              className="font-medium text-primary hover:text-primary-light transition-colors"
            >
              Criar conta
            </button>
          </p>
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-gray-600">
        Protegido por autenticação JWT com cookies HTTP-only
      </p>
    </div>
  );
}
