'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface AiProvider {
  id: string;
  name: string;
  description: string;
  models: string[];
  requiresApiKey: boolean;
  requiresEndpoint?: boolean;
}

interface AiConfig {
  provider: string;
  model: string;
  endpoint?: string;
  configured: boolean;
}

export default function AiConfigPage() {
  const [providers, setProviders] = useState<AiProvider[]>([]);
  const [config, setConfig] = useState<AiConfig | null>(null);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [endpoint, setEndpoint] = useState('');
  const [model, setModel] = useState('');
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(
    null,
  );

  useEffect(() => {
    loadProviders();
    loadConfig();
  }, []);

  const loadProviders = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/ai-providers/available`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        },
      );
      setProviders(response.data.providers);
    } catch (error) {
      console.error('Erro ao carregar provedores:', error);
    }
  };

  const loadConfig = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/ai-providers/config`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        },
      );
      setConfig(response.data);
      setSelectedProvider(response.data.provider);
      setModel(response.data.model);
      if (response.data.endpoint) {
        setEndpoint(response.data.endpoint);
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
    }
  };

  const handleTestProvider = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/ai-providers/test`,
        {
          provider: selectedProvider,
          apiKey,
          endpoint: endpoint || undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        },
      );
      setTestResult(response.data);
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error.response?.data?.message || 'Erro ao testar provedor',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSaveConfig = async () => {
    setSaving(true);

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/ai-providers/config`,
        {
          provider: selectedProvider,
          apiKey,
          endpoint: endpoint || undefined,
          model,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        },
      );
      alert('Configuração salva com sucesso!');
      loadConfig();
      setApiKey('');
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      alert('Erro ao salvar configuração');
    } finally {
      setSaving(false);
    }
  };

  const selectedProviderData = providers.find((p) => p.id === selectedProvider);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Configuração de IA</h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Selecione o Provedor de IA</h2>

          <div className="space-y-4">
            {providers.map((provider) => (
              <div
                key={provider.id}
                className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                  selectedProvider === provider.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
                onClick={() => {
                  setSelectedProvider(provider.id);
                  if (provider.models.length > 0) {
                    setModel(provider.models[0]);
                  }
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{provider.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {provider.description}
                    </p>
                    <div className="mt-2">
                      <span className="text-xs text-gray-500">Modelos disponíveis: </span>
                      <span className="text-xs text-gray-700 dark:text-gray-300">
                        {provider.models.join(', ')}
                      </span>
                    </div>
                  </div>
                  {selectedProvider === provider.id && (
                    <div className="flex-shrink-0 ml-4">
                      <svg
                        className="w-6 h-6 text-blue-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedProviderData && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
              Configurar {selectedProviderData.name}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Modelo</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                >
                  {selectedProviderData.models.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {selectedProviderData.requiresApiKey && (
                <div>
                  <label className="block text-sm font-medium mb-2">API Key</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={
                      config?.configured
                        ? 'Deixe em branco para manter a chave atual'
                        : 'Cole sua API Key aqui'
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Suas chaves são armazenadas de forma segura e nunca são expostas.
                  </p>
                </div>
              )}

              {selectedProviderData.requiresEndpoint && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Endpoint da API Local
                  </label>
                  <input
                    type="text"
                    value={endpoint}
                    onChange={(e) => setEndpoint(e.target.value)}
                    placeholder="http://localhost:11434"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Ex: http://localhost:11434 para Ollama ou http://localhost:1234 para LM Studio
                  </p>
                </div>
              )}

              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleTestProvider}
                  disabled={testing || (!apiKey && selectedProviderData.requiresApiKey && !config?.configured)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {testing ? 'Testando...' : 'Testar Conexão'}
                </button>

                <button
                  onClick={handleSaveConfig}
                  disabled={saving || (!apiKey && selectedProviderData.requiresApiKey && !config?.configured)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Salvando...' : 'Salvar Configuração'}
                </button>
              </div>

              {testResult && (
                <div
                  className={`mt-4 p-4 rounded-md ${
                    testResult.success
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                      : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                  }`}
                >
                  <p className="font-medium">
                    {testResult.success ? '✓ Sucesso!' : '✗ Erro'}
                  </p>
                  <p className="text-sm mt-1">{testResult.message}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Recursos de IA Disponíveis
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Análise automática de vulnerabilidades</li>
            <li>• Geração de planos de remediação</li>
            <li>• Consultas personalizadas sobre segurança</li>
            <li>• Suporte para múltiplos provedores e modelos</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
