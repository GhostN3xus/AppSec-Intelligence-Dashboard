'use client';

import { useEffect, useState } from 'react';
import api from '../../lib/api-client';

type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
};

export default function ConfiguracoesPage() {
  const [sla, setSla] = useState({ critical: 7, high: 15, medium: 30, low: 60 });
  const [status, setStatus] = useState('');
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: 'ChangeMe123!', role: 'analyst' });
  const [loginLogs, setLoginLogs] = useState<any[]>([]);
  const [importHistory, setImportHistory] = useState<any[]>([]);

  useEffect(() => {
    api.get('/sla/config').then((response) => setSla(response.data));
    loadUsers();
    api.get('/audit/logins').then((response) => setLoginLogs(response.data ?? []));
    api.get('/integrations/history').then((response) => setImportHistory(response.data ?? []));
  }, []);

  const loadUsers = () => {
    api.get('/users').then((response) => setUsers(response.data ?? []));
  };

  const handleSave = async () => {
    await api.patch('/sla/config', sla);
    setStatus('Configurações atualizadas');
  };

  const handleCreateUser = async () => {
    await api.post('/users', newUser);
    setNewUser({ name: '', email: '', password: 'ChangeMe123!', role: 'analyst' });
    loadUsers();
  };

  const toggleStatus = async (user: UserRecord) => {
    await api.patch(`/users/${user.id}`, { status: user.status === 'active' ? 'suspended' : 'active' });
    loadUsers();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="cyber-card space-y-4">
        <h1 className="text-2xl font-display text-primary-light">Configurações de SLA</h1>
        <p className="text-sm text-gray-400">
          Ajuste os prazos de correção de acordo com a política corporativa. Valores em dias corridos.
        </p>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(sla).map(([key, value]) => (
            <label key={key} className="space-y-2 text-sm text-gray-300">
              <span className="uppercase">{key}</span>
              <input
                type="number"
                className="w-full rounded border border-slate-700 bg-slate-900 p-2"
                value={value}
                onChange={(event) => setSla((prev) => ({ ...prev, [key]: Number(event.target.value) }))}
              />
            </label>
          ))}
        </div>
        <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white" onClick={handleSave}>
          Salvar SLA
        </button>
        {status ? <div className="text-xs text-emerald-400">{status}</div> : null}
      </div>
      <div className="cyber-card space-y-2 text-sm text-gray-300">
        <h2 className="text-xl font-display text-primary-light">Integrações suportadas</h2>
        <ul className="list-disc space-y-1 pl-5 text-gray-400">
          <li>Semgrep (CSV/JSON) via CLI e upload</li>
          <li>Nessus, Nmap, Burp Suite, OWASP ZAP (JSON) via API</li>
          <li>Conectores IA (Claude, GPT, Azure OpenAI) configuráveis por variáveis de ambiente</li>
        </ul>
        <p>
          Utilize <code className="rounded bg-slate-900 px-1">make import-semgrep file=./relatorios/semgrep.csv</code> para importar relatórios via CLI.
        </p>
      </div>
      <div className="cyber-card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-display text-primary-light">Usuários da Plataforma</h2>
          <button
            onClick={handleCreateUser}
            className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:brightness-110"
          >
            Criar usuário
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={newUser.name}
            onChange={(event) => setNewUser((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="Nome"
            className="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
          />
          <input
            value={newUser.email}
            onChange={(event) => setNewUser((prev) => ({ ...prev, email: event.target.value }))}
            placeholder="E-mail corporativo"
            className="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
          />
          <input
            value={newUser.password}
            onChange={(event) => setNewUser((prev) => ({ ...prev, password: event.target.value }))}
            placeholder="Senha temporária"
            className="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
          />
          <select
            value={newUser.role}
            onChange={(event) => setNewUser((prev) => ({ ...prev, role: event.target.value }))}
            className="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
          >
            <option value="admin">Administrador</option>
            <option value="analyst">Analista</option>
            <option value="owner">Responsável</option>
            <option value="auditor">Auditor</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase text-gray-500">
              <tr>
                <th className="py-2">Nome</th>
                <th className="py-2">E-mail</th>
                <th className="py-2">Role</th>
                <th className="py-2">Status</th>
                <th className="py-2">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="py-3 text-white">{user.name}</td>
                  <td className="py-3 text-gray-300">{user.email}</td>
                  <td className="py-3 uppercase text-gray-400">{user.role}</td>
                  <td className="py-3 text-gray-400">{user.status}</td>
                  <td className="py-3">
                    <button className="text-primary hover:underline" onClick={() => toggleStatus(user)}>
                      {user.status === 'active' ? 'Suspender' : 'Reativar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="cyber-card space-y-4">
        <h2 className="text-xl font-display text-primary-light">Logs de Login</h2>
        <div className="max-h-72 overflow-auto text-xs text-gray-300">
          <table className="min-w-full text-left">
            <thead className="text-[10px] uppercase text-gray-500">
              <tr>
                <th className="py-2">E-mail</th>
                <th className="py-2">Status</th>
                <th className="py-2">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loginLogs.map((log) => (
                <tr key={log.id}>
                  <td className="py-2">{log.email}</td>
                  <td className={`py-2 ${log.success ? 'text-emerald-300' : 'text-red-300'}`}>{log.success ? 'Sucesso' : 'Falha'}</td>
                  <td className="py-2 text-gray-400">{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="cyber-card space-y-4">
        <h2 className="text-xl font-display text-primary-light">Histórico de Importações</h2>
        <div className="max-h-72 overflow-auto text-xs text-gray-300">
          <table className="min-w-full text-left">
            <thead className="text-[10px] uppercase text-gray-500">
              <tr>
                <th className="py-2">Ferramenta</th>
                <th className="py-2">Arquivo</th>
                <th className="py-2">Findings</th>
                <th className="py-2">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {importHistory.map((item) => (
                <tr key={item.id}>
                  <td className="py-2">{item.tool}</td>
                  <td className="py-2 text-gray-400">{item.filename ?? '-'}</td>
                  <td className="py-2">{item.findings}</td>
                  <td className="py-2 text-gray-400">{new Date(item.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
