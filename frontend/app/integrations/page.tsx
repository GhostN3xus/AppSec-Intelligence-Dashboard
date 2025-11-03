'use client';

import { useEffect, useMemo, useState } from 'react';
import api from '../../lib/api-client';
import { ArrowPathIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

type IntegrationStatus = {
  provider: string;
  enabled: boolean;
  details: Record<string, any> | null;
  updatedAt: string;
};

export default function IntegrationsPage() {
  const [statuses, setStatuses] = useState<IntegrationStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const telegramStatus = useMemo(
    () => statuses.find((status) => status.provider === 'telegram'),
    [statuses],
  );

  const loadStatuses = () => {
    setLoading(true);
    setError(null);
    api
      .get<IntegrationStatus[]>('/integrations')
      .then((response) => setStatuses(response.data ?? []))
      .catch(() => setError('Não foi possível carregar as integrações configuradas.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadStatuses();
  }, []);

  useEffect(() => {
    if (telegramStatus?.details) {
      setBotToken(telegramStatus.details.botToken ?? '');
      setChatId(telegramStatus.details.chatId ?? '');
      setEnabled(Boolean(telegramStatus.details.enabled));
    }
  }, [telegramStatus]);

  const saveTelegram = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await api.post('/integrations/telegram', {
        botToken,
        chatId,
        enabled,
      });
      setSuccess('Configurações do Telegram atualizadas com sucesso.');
      loadStatuses();
    } catch (err) {
      console.error(err);
      setError('Falha ao salvar a integração com o Telegram.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-display text-primary-light">Integrações e Alertas</h1>
        <p className="text-sm text-gray-400">
          Conecte o dashboard com canais externos (Telegram) para receber notificações de novas importações e eventos relevantes.
        </p>
      </div>

      <div className="cyber-card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Status das integrações</h2>
          <button
            onClick={loadStatuses}
            className="flex items-center gap-2 rounded-lg border border-primary/60 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-primary hover:bg-primary/10"
          >
            <ArrowPathIcon className="h-4 w-4" /> Atualizar
          </button>
        </div>

        {loading ? (
          <div className="text-sm text-gray-400">Carregando integrações...</div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {statuses.map((status) => (
              <div key={status.provider} className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white capitalize">{status.provider}</p>
                    <p className="text-xs text-gray-500">
                      Atualizado em {new Date(status.updatedAt).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                      status.enabled ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-gray-400'
                    }`}
                  >
                    {status.enabled ? 'Ativo' : 'Desativado'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="cyber-card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Telegram Bot</h2>
          <PaperAirplaneIcon className="h-5 w-5 text-primary" />
        </div>

        <p className="text-sm text-gray-400">
          Informe o token do bot e o chat ID que deve receber os alertas de importação (SAST/SCA). Recomendamos criar um bot dedicado para o dashboard.
        </p>

        {error && <div className="rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div>}
        {success && <div className="rounded border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{success}</div>}

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm text-gray-300">
            Token do bot
            <input
              value={botToken}
              onChange={(event) => setBotToken(event.target.value)}
              placeholder="123456:ABCDEF"
              className="w-full rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
            />
          </label>
          <label className="space-y-1 text-sm text-gray-300">
            Chat ID
            <input
              value={chatId}
              onChange={(event) => setChatId(event.target.value)}
              placeholder="-100123456"
              className="w-full rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
            />
          </label>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-300">
          <input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} />
          Ativar alertas automáticos
        </label>

        <button
          onClick={saveTelegram}
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-primary/60 bg-primary/10 px-3 py-2 text-sm font-semibold uppercase tracking-wide text-primary hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <PaperAirplaneIcon className="h-5 w-5" /> {saving ? 'Salvando...' : 'Salvar integração'}
        </button>
      </div>
    </div>
  );
}
