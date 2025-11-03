'use client';

import { useEffect, useState } from 'react';
import { MarkdownEditor } from '../../components/editor/markdown-editor';
import api from '../../lib/api-client';

export default function EditorPage() {
  const [content, setContent] = useState('');
  const [name, setName] = useState('Relatório personalizado');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('appsec-editor');
    if (saved) setContent(saved);
  }, []);

  const handleSave = () => {
    localStorage.setItem('appsec-editor', content);
    setStatus('Rascunho salvo localmente.');
  };

  const handleExport = async (format: 'pdf' | 'docx' | 'html') => {
    try {
      const response = await api.post(
        '/reports/export',
        { name, format, content },
        { responseType: 'blob' },
      );
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${name}.${format}`;
      link.click();
    } catch (error: any) {
      setStatus(error?.response?.data?.message ?? 'Falha ao exportar.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display text-primary-light">Editor de Relatórios (Word)</h1>
        <p className="text-sm text-gray-400">
          Edite documentos com cabeçalho institucional, tabelas, imagens e exporte em PDF/DOCX/HTML.
        </p>
      </div>
      <div className="cyber-card space-y-4">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-2 text-sm text-gray-100 focus:border-primary focus:outline-none"
        />
        <MarkdownEditor value={content} onChange={setContent} />
        {status ? <div className="text-sm text-emerald-400">{status}</div> : null}
        <div className="flex flex-wrap gap-3">
          <button onClick={handleSave} className="rounded-lg border border-primary/60 px-4 py-2 text-xs font-medium uppercase tracking-wide text-primary hover:bg-primary/10">
            Salvar rascunho
          </button>
          <button onClick={() => handleExport('pdf')} className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:brightness-110">
            Exportar PDF
          </button>
          <button onClick={() => handleExport('docx')} className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:brightness-110">
            Exportar DOCX
          </button>
          <button onClick={() => handleExport('html')} className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:brightness-110">
            Exportar HTML
          </button>
        </div>
      </div>
    </div>
  );
}
