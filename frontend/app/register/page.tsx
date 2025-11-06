'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  UserPlusIcon,
  EnvelopeIcon,
  LockClosedIcon,
  UserCircleIcon,
  ExclamationCircleIcon,
  BriefcaseIcon,
  LanguageIcon
} from '@heroicons/react/24/outline';
import api from '../../lib/api-client';
import { useAuthStore } from '../../store/auth-store';

const roles = [
  { value: 'analyst', label: 'Analista AppSec', description: 'Visualiza e gerencia vulnerabilidades' },
  { value: 'admin', label: 'Administrador', description: 'Acesso completo ao sistema' },
  { value: 'owner', label: 'Responsável Técnico', description: 'Proprietário de aplicações' },
  { value: 'auditor', label: 'Auditor', description: 'Acesso somente leitura' },
];

type RegisterForm = {
  name: string;
  email: string;
  password: string;
  role: string;
  language: string;
  title?: string;
};

/**
 * RegisterPage - User registration page
 *
 * Features:
 * - Comprehensive form validation
 * - Role selection with descriptions
 * - Clean UI without sidebar/topbar
 * - Automatic login after registration
 */
export default function RegisterPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<RegisterForm>({
    defaultValues: { language: 'pt-BR', role: 'analyst' },
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setUser = useAuthStore((state) => state.setUser);

  const selectedRole = watch('role');

  const onSubmit = handleSubmit(async (values) => {
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/register', values);

      // Set user in global state
      setUser(response.data.user);

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message;

      // User-friendly error messages
      if (errorMessage?.includes('já existe') || errorMessage?.includes('already exists')) {
        setError('Este e-mail já está cadastrado. Faça login ou use outro e-mail.');
      } else if (errorMessage?.includes('email') || errorMessage?.includes('E-mail')) {
        setError('E-mail inválido. Use um e-mail corporativo válido.');
      } else {
        setError(errorMessage || 'Erro ao criar conta. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  });

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="rounded-full bg-primary/10 p-4 backdrop-blur-sm border border-primary/20">
            <UserPlusIcon className="h-12 w-12 text-primary" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-display font-bold text-white tracking-tight">
            Criar Nova Conta
          </h1>
          <p className="text-gray-400">
            Cadastre-se para acessar o painel de segurança
          </p>
        </div>
      </div>

      {/* Registration Form Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-8 shadow-2xl backdrop-blur-sm">
        <form className="space-y-6" onSubmit={onSubmit}>
          {/* Name Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200" htmlFor="name">
              Nome completo
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <UserCircleIcon className="h-5 w-5 text-gray-500" />
              </div>
              <input
                id="name"
                type="text"
                autoComplete="name"
                {...register('name', {
                  required: 'Nome é obrigatório',
                  minLength: {
                    value: 3,
                    message: 'Nome deve ter pelo menos 3 caracteres'
                  }
                })}
                className={`w-full rounded-lg border ${
                  errors.name ? 'border-red-500' : 'border-slate-800'
                } bg-slate-900/70 pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all`}
                placeholder="João Silva"
              />
            </div>
            {errors.name && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <ExclamationCircleIcon className="h-4 w-4" />
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Email and Password Grid */}
          <div className="grid md:grid-cols-2 gap-6">
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
              <label className="text-sm font-medium text-gray-200" htmlFor="password">
                Senha
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <LockClosedIcon className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  {...register('password', {
                    required: 'Senha é obrigatória',
                    minLength: {
                      value: 6,
                      message: 'Senha deve ter pelo menos 6 caracteres'
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
          </div>

          {/* Title and Language Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Title Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200" htmlFor="title">
                Cargo (opcional)
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <BriefcaseIcon className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="title"
                  type="text"
                  {...register('title')}
                  className="w-full rounded-lg border border-slate-800 bg-slate-900/70 pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Analista de Segurança"
                />
              </div>
            </div>

            {/* Language Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200" htmlFor="language">
                Idioma
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <LanguageIcon className="h-5 w-5 text-gray-500" />
                </div>
                <select
                  id="language"
                  {...register('language')}
                  className="w-full rounded-lg border border-slate-800 bg-slate-900/70 pl-10 pr-4 py-3 text-sm text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                >
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en-US">English (US)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-200">
              Perfil de acesso
            </label>
            <div className="grid gap-3 md:grid-cols-2">
              {roles.map((role) => (
                <label
                  key={role.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border ${
                    selectedRole === role.value
                      ? 'border-primary bg-primary/10'
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                  } px-4 py-3 text-sm transition-all`}
                >
                  <input
                    type="radio"
                    value={role.value}
                    {...register('role')}
                    className="mt-1 accent-primary"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-white">{role.label}</div>
                    <div className="text-xs text-gray-400 mt-1">{role.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
              <div className="flex items-start gap-3">
                <ExclamationCircleIcon className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-300">Erro ao criar conta</p>
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
                Criando conta...
              </span>
            ) : (
              'Criar Conta'
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

        {/* Login Link */}
        <div className="text-center">
          <p className="text-sm text-gray-400">
            Já tem uma conta?{' '}
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="font-medium text-primary hover:text-primary-light transition-colors"
            >
              Fazer login
            </button>
          </p>
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-gray-600">
        Ao criar uma conta, você concorda com os termos de uso
      </p>
    </div>
  );
}
