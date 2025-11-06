'use client';

import Link from 'next/link';
import {
  BookOpenIcon,
  CommandLineIcon,
  CogIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CloudArrowUpIcon,
  UserGroupIcon,
  RocketLaunchIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-16">
      {/* Header */}
      <section className="text-center space-y-4 pt-8">
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/10 border border-primary/30">
          <ShieldCheckIcon className="h-5 w-5 text-primary-light" />
          <span className="text-sm font-medium text-primary-light">AppSec Intelligence Dashboard</span>
        </div>
        <h1 className="text-5xl font-display font-bold text-white">
          Bem-vindo ao Dashboard de Segurança de Aplicações
        </h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          Plataforma integrada para consolidar, correlacionar e gerenciar vulnerabilidades de segurança.
          Centralize dados de SAST, DAST, SCA e mais em um único lugar.
        </p>
      </section>

      {/* Quick Start Cards */}
      <section className="grid gap-6 md:grid-cols-3">
        <Link
          href="/dashboard"
          className="group rounded-2xl border border-slate-800 bg-gradient-to-br from-blue-500/20 to-blue-600/5 p-6 transition hover:border-primary/70 hover:shadow-lg hover:shadow-primary/10"
        >
          <ChartBarIcon className="h-10 w-10 text-blue-400 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Ver Dashboard</h3>
          <p className="text-sm text-gray-400">Visualize métricas, vulnerabilidades e status de SLA</p>
        </Link>

        <Link
          href="/login"
          className="group rounded-2xl border border-slate-800 bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 p-6 transition hover:border-primary/70 hover:shadow-lg hover:shadow-primary/10"
        >
          <RocketLaunchIcon className="h-10 w-10 text-emerald-400 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Começar Agora</h3>
          <p className="text-sm text-gray-400">Faça login para acessar todas as funcionalidades</p>
        </Link>

        <Link
          href="/docs"
          className="group rounded-2xl border border-slate-800 bg-gradient-to-br from-purple-500/20 to-purple-600/5 p-6 transition hover:border-primary/70 hover:shadow-lg hover:shadow-primary/10"
        >
          <BookOpenIcon className="h-10 w-10 text-purple-400 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Documentação</h3>
          <p className="text-sm text-gray-400">Acesse guias e documentação técnica completa</p>
        </Link>
      </section>

      {/* O que é a Plataforma */}
      <section className="rounded-2xl border border-slate-800 bg-slate-950/60 p-8 space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <ShieldCheckIcon className="h-8 w-8 text-primary-light" />
          <h2 className="text-3xl font-display font-bold text-white">O que é esta Plataforma?</h2>
        </div>

        <p className="text-gray-300 text-lg leading-relaxed">
          O <strong className="text-primary-light">AppSec Intelligence Dashboard</strong> é uma solução completa para equipes de segurança
          consolidarem e gerenciarem vulnerabilidades de múltiplas fontes. A plataforma oferece:
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <CheckCircleIcon className="h-6 w-6 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-white mb-1">Consolidação de Dados</h4>
              <p className="text-sm text-gray-400">
                Importe dados de SAST (Semgrep), DAST, SCA e outras ferramentas em um único dashboard
              </p>
            </div>
          </div>

          <div className="flex gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <CheckCircleIcon className="h-6 w-6 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-white mb-1">Correlação Inteligente</h4>
              <p className="text-sm text-gray-400">
                Correlacione achados de diferentes fontes e elimine duplicatas automaticamente
              </p>
            </div>
          </div>

          <div className="flex gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <CheckCircleIcon className="h-6 w-6 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-white mb-1">Gestão de SLA</h4>
              <p className="text-sm text-gray-400">
                Acompanhe prazos de remediação por severidade com alertas automáticos
              </p>
            </div>
          </div>

          <div className="flex gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <CheckCircleIcon className="h-6 w-6 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-white mb-1">IA Integrada</h4>
              <p className="text-sm text-gray-400">
                Use IA para triagem automática, detecção de falsos positivos e sugestões de remediação
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Como Configurar */}
      <section className="rounded-2xl border border-slate-800 bg-slate-950/60 p-8 space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <CogIcon className="h-8 w-8 text-blue-400" />
          <h2 className="text-3xl font-display font-bold text-white">Como Configurar</h2>
        </div>

        <div className="space-y-8">
          {/* Setup Rápido */}
          <div>
            <h3 className="text-xl font-semibold text-primary-light mb-4 flex items-center gap-2">
              <CommandLineIcon className="h-6 w-6" />
              1. Instalação Rápida (Recomendado)
            </h3>
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
              <p className="text-gray-400 mb-3">Execute o script de setup automatizado:</p>
              <pre className="bg-black/50 rounded-lg p-4 text-emerald-400 text-sm overflow-x-auto">
                <code>./setup.sh</code>
              </pre>
              <p className="text-gray-400 mt-3 text-sm">
                O assistente solicitará a chave de API de IA (ex.: OpenAI) e configurará tudo automaticamente.
              </p>
            </div>
          </div>

          {/* Setup Manual */}
          <div>
            <h3 className="text-xl font-semibold text-primary-light mb-4">2. Instalação Manual</h3>
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-4">
              <div>
                <p className="text-gray-300 mb-2">Instale as dependências:</p>
                <pre className="bg-black/50 rounded-lg p-4 text-emerald-400 text-sm overflow-x-auto">
                  <code>make install</code>
                </pre>
              </div>

              <div>
                <p className="text-gray-300 mb-2">Configure o arquivo .env:</p>
                <pre className="bg-black/50 rounded-lg p-4 text-emerald-400 text-sm overflow-x-auto">
                  <code>cp backend/.env.example backend/.env</code>
                </pre>
              </div>

              <div>
                <p className="text-gray-300 mb-2">Gere o Prisma Client e popule o banco:</p>
                <pre className="bg-black/50 rounded-lg p-4 text-emerald-400 text-sm overflow-x-auto">
                  <code>{`make prisma-generate\nmake seed`}</code>
                </pre>
              </div>

              <div>
                <p className="text-gray-300 mb-2">Inicie os serviços:</p>
                <pre className="bg-black/50 rounded-lg p-4 text-emerald-400 text-sm overflow-x-auto">
                  <code>{`make dev-backend   # API em http://localhost:4000\nmake dev-frontend  # Frontend em http://localhost:3000`}</code>
                </pre>
              </div>
            </div>
          </div>

          {/* Docker */}
          <div>
            <h3 className="text-xl font-semibold text-primary-light mb-4">3. Usando Docker (Alternativa)</h3>
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
              <pre className="bg-black/50 rounded-lg p-4 text-emerald-400 text-sm overflow-x-auto">
                <code>docker-compose up --build</code>
              </pre>
            </div>
          </div>

          {/* Credenciais Padrão */}
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-4">
            <h4 className="font-semibold text-amber-300 mb-2 flex items-center gap-2">
              <UserGroupIcon className="h-5 w-5" />
              Credenciais Padrão
            </h4>
            <p className="text-amber-200/80 text-sm">
              <strong>Email:</strong> admin@appsec.local<br />
              <strong>Senha:</strong> admin123
            </p>
          </div>
        </div>
      </section>

      {/* Como Usar */}
      <section className="rounded-2xl border border-slate-800 bg-slate-950/60 p-8 space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <DocumentTextIcon className="h-8 w-8 text-purple-400" />
          <h2 className="text-3xl font-display font-bold text-white">Como Usar a Plataforma</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Importar Dados */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <CloudArrowUpIcon className="h-7 w-7 text-cyan-400" />
              <h3 className="text-lg font-semibold text-white">1. Importar Dados</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex gap-2">
                <span className="text-cyan-400">→</span>
                <span>Acesse <Link href="/sast" className="text-primary-light hover:underline">/sast</Link> para importar relatórios SAST (Semgrep CSV)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-cyan-400">→</span>
                <span>Use <Link href="/sast/sca" className="text-primary-light hover:underline">/sast/sca</Link> para dados de Supply Chain (SCA)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-cyan-400">→</span>
                <span>Ou use a API: <code className="text-emerald-400">POST /api/import/sast</code></span>
              </li>
            </ul>
          </div>

          {/* Gerenciar Aplicações */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <CogIcon className="h-7 w-7 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">2. Gerenciar Aplicações</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex gap-2">
                <span className="text-blue-400">→</span>
                <span>Cadastre aplicações em <Link href="/applications" className="text-primary-light hover:underline">/applications</Link></span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400">→</span>
                <span>Defina responsáveis em <Link href="/responsaveis" className="text-primary-light hover:underline">/responsaveis</Link></span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400">→</span>
                <span>Configure SLAs em <Link href="/sla" className="text-primary-light hover:underline">/sla</Link></span>
              </li>
            </ul>
          </div>

          {/* Visualizar Métricas */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <ChartBarIcon className="h-7 w-7 text-emerald-400" />
              <h3 className="text-lg font-semibold text-white">3. Visualizar Métricas</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex gap-2">
                <span className="text-emerald-400">→</span>
                <span>Dashboard principal em <Link href="/dashboard" className="text-primary-light hover:underline">/dashboard</Link></span>
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-400">→</span>
                <span>Veja vulnerabilidades em <Link href="/vulnerabilities" className="text-primary-light hover:underline">/vulnerabilities</Link></span>
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-400">→</span>
                <span>Acompanhe status de SLA por severidade</span>
              </li>
            </ul>
          </div>

          {/* Usar IA */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <ShieldCheckIcon className="h-7 w-7 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">4. Usar IA</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex gap-2">
                <span className="text-purple-400">→</span>
                <span>Configure chaves de API em <Link href="/ia" className="text-primary-light hover:underline">/ia</Link></span>
              </li>
              <li className="flex gap-2">
                <span className="text-purple-400">→</span>
                <span>Use triagem automática para classificar vulnerabilidades</span>
              </li>
              <li className="flex gap-2">
                <span className="text-purple-400">→</span>
                <span>Detecte falsos positivos automaticamente</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Recursos Principais */}
      <section className="rounded-2xl border border-slate-800 bg-slate-950/60 p-8 space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <RocketLaunchIcon className="h-8 w-8 text-cyan-400" />
          <h2 className="text-3xl font-display font-bold text-white">Recursos Principais</h2>
        </div>

        <div className="space-y-4">
          <details className="group rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
            <summary className="cursor-pointer p-5 font-semibold text-white hover:bg-slate-800/50 transition">
              📊 Dashboard Interativo
            </summary>
            <div className="p-5 pt-0 text-gray-400 text-sm space-y-2">
              <p>Visualize métricas em tempo real:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Total de vulnerabilidades por severidade (Critical, High, Medium, Low)</li>
                <li>Status de SLA (vencido, em risco, no prazo)</li>
                <li>Top 10 aplicações mais críticas</li>
                <li>Taxa de falsos positivos detectados por IA</li>
              </ul>
            </div>
          </details>

          <details className="group rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
            <summary className="cursor-pointer p-5 font-semibold text-white hover:bg-slate-800/50 transition">
              🤖 Integração com IA
            </summary>
            <div className="p-5 pt-0 text-gray-400 text-sm space-y-2">
              <p>Suporte para OpenAI e Azure OpenAI:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Triagem automática de vulnerabilidades</li>
                <li>Detecção de falsos positivos com alta precisão</li>
                <li>Sugestões de remediação baseadas em contexto</li>
                <li>Resumos executivos automáticos</li>
                <li>Fallback local caso não tenha chave de API</li>
              </ul>
            </div>
          </details>

          <details className="group rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
            <summary className="cursor-pointer p-5 font-semibold text-white hover:bg-slate-800/50 transition">
              📁 Importação Multi-Fonte
            </summary>
            <div className="p-5 pt-0 text-gray-400 text-sm space-y-2">
              <p>Importe dados de várias ferramentas:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Semgrep SAST (formato CSV)</li>
                <li>Semgrep Supply Chain / SCA</li>
                <li>Importação automática via container sast-parser</li>
                <li>API genérica para outras ferramentas (JSON)</li>
                <li>Logs detalhados de cada importação</li>
              </ul>
            </div>
          </details>

          <details className="group rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
            <summary className="cursor-pointer p-5 font-semibold text-white hover:bg-slate-800/50 transition">
              ⏰ Gestão de SLA
            </summary>
            <div className="p-5 pt-0 text-gray-400 text-sm space-y-2">
              <p>Acompanhe prazos de remediação:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>SLA padrão: Critical (7d), High (15d), Medium (30d), Low (60d)</li>
                <li>Configuração personalizável por severidade</li>
                <li>Alertas automáticos para itens vencidos</li>
                <li>Dashboard de status de SLA</li>
              </ul>
            </div>
          </details>

          <details className="group rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
            <summary className="cursor-pointer p-5 font-semibold text-white hover:bg-slate-800/50 transition">
              📝 Templates de Relatório
            </summary>
            <div className="p-5 pt-0 text-gray-400 text-sm space-y-2">
              <p>Gere relatórios profissionais:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Relatórios de Pentest (técnico e executivo)</li>
                <li>Relatórios de SAST e DAST</li>
                <li>Planos de remediação</li>
                <li>Análise de falsos positivos</li>
                <li>Exportação em PDF, DOCX, HTML ou JSON</li>
              </ul>
            </div>
          </details>

          <details className="group rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
            <summary className="cursor-pointer p-5 font-semibold text-white hover:bg-slate-800/50 transition">
              🔐 Auditoria e Logs
            </summary>
            <div className="p-5 pt-0 text-gray-400 text-sm space-y-2">
              <p>Rastreie todas as ações:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Logs detalhados de importações</li>
                <li>Auditoria de ações de usuários</li>
                <li>Histórico de alterações em SLAs</li>
                <li>Registro de configurações de integrações</li>
              </ul>
            </div>
          </details>
        </div>
      </section>

      {/* Variáveis de Ambiente */}
      <section className="rounded-2xl border border-slate-800 bg-slate-950/60 p-8 space-y-6">
        <h2 className="text-3xl font-display font-bold text-white">Variáveis de Ambiente Importantes</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left py-3 px-4 text-primary-light font-semibold">Variável</th>
                <th className="text-left py-3 px-4 text-primary-light font-semibold">Descrição</th>
              </tr>
            </thead>
            <tbody className="text-gray-400">
              <tr className="border-b border-slate-800/50">
                <td className="py-3 px-4 font-mono text-emerald-400">DATABASE_URL</td>
                <td className="py-3 px-4">String de conexão PostgreSQL</td>
              </tr>
              <tr className="border-b border-slate-800/50">
                <td className="py-3 px-4 font-mono text-emerald-400">JWT_SECRET</td>
                <td className="py-3 px-4">Chave secreta para autenticação JWT</td>
              </tr>
              <tr className="border-b border-slate-800/50">
                <td className="py-3 px-4 font-mono text-emerald-400">JWT_EXPIRATION</td>
                <td className="py-3 px-4">Tempo de expiração do token JWT</td>
              </tr>
              <tr className="border-b border-slate-800/50">
                <td className="py-3 px-4 font-mono text-emerald-400">OPENAI_API_KEY</td>
                <td className="py-3 px-4">(Opcional) Chave da API OpenAI</td>
              </tr>
              <tr className="border-b border-slate-800/50">
                <td className="py-3 px-4 font-mono text-emerald-400">AZURE_OPENAI_ENDPOINT</td>
                <td className="py-3 px-4">(Opcional) Endpoint do Azure OpenAI</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono text-emerald-400">AZURE_OPENAI_KEY</td>
                <td className="py-3 px-4">(Opcional) Chave do Azure OpenAI</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Links Úteis */}
      <section className="rounded-2xl border border-slate-800 bg-gradient-to-br from-primary/10 to-transparent p-8">
        <h2 className="text-3xl font-display font-bold text-white mb-6">Links Rápidos</h2>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/dashboard"
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 hover:border-primary/50 transition"
          >
            <h4 className="font-semibold text-white mb-1">Dashboard</h4>
            <p className="text-xs text-gray-400">Ver métricas e status</p>
          </Link>

          <Link
            href="/vulnerabilities"
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 hover:border-primary/50 transition"
          >
            <h4 className="font-semibold text-white mb-1">Vulnerabilidades</h4>
            <p className="text-xs text-gray-400">Listar achados de segurança</p>
          </Link>

          <Link
            href="/applications"
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 hover:border-primary/50 transition"
          >
            <h4 className="font-semibold text-white mb-1">Aplicações</h4>
            <p className="text-xs text-gray-400">Gerenciar aplicações</p>
          </Link>

          <Link
            href="/sast"
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 hover:border-primary/50 transition"
          >
            <h4 className="font-semibold text-white mb-1">Importar SAST</h4>
            <p className="text-xs text-gray-400">Upload de relatórios</p>
          </Link>

          <Link
            href="/ia"
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 hover:border-primary/50 transition"
          >
            <h4 className="font-semibold text-white mb-1">Configurar IA</h4>
            <p className="text-xs text-gray-400">Chaves de API</p>
          </Link>

          <Link
            href="/templates"
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 hover:border-primary/50 transition"
          >
            <h4 className="font-semibold text-white mb-1">Templates</h4>
            <p className="text-xs text-gray-400">Relatórios personalizáveis</p>
          </Link>

          <Link
            href="/sla"
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 hover:border-primary/50 transition"
          >
            <h4 className="font-semibold text-white mb-1">SLA</h4>
            <p className="text-xs text-gray-400">Configurar prazos</p>
          </Link>

          <Link
            href="/docs"
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 hover:border-primary/50 transition"
          >
            <h4 className="font-semibold text-white mb-1">Documentação</h4>
            <p className="text-xs text-gray-400">Guias completos</p>
          </Link>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="text-center space-y-6 py-8">
        <h2 className="text-2xl font-display font-bold text-white">Pronto para começar?</h2>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold transition"
          >
            <RocketLaunchIcon className="h-5 w-5" />
            Fazer Login
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-700 hover:border-primary text-white font-semibold transition"
          >
            <UserGroupIcon className="h-5 w-5" />
            Criar Conta
          </Link>
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-700 hover:border-primary text-white font-semibold transition"
          >
            <BookOpenIcon className="h-5 w-5" />
            Ver Documentação
          </Link>
        </div>
      </section>
    </div>
  );
}
