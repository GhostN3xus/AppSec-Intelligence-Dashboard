'use client';

import { useEffect, useState } from 'react';
import api from '../../lib/api-client';
import { MarkdownEditor } from '../../components/editor/markdown-editor';

export default function DocumentacaoPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<string>('');

  const load = () => {
    api.get('/knowledge-base').then((response) => setDocuments(response.data ?? []));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSelect = (doc: any) => {
    setSelected(doc);
    setContent(doc.content);
    setStatus('');
  };

  const handleSave = async () => {
    if (!selected) return;
    try {
      await api.put(`/knowledge-base/${selected.slug}`, { ...selected, content });
      setStatus('Documento atualizado com sucesso.');
      load();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setStatus('Erro ao salvar documento.');
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    if (!confirm(`Tem certeza que deseja excluir "${selected.title}"?`)) return;
    try {
      await api.delete(`/knowledge-base/${selected.slug}`);
      setSelected(null);
      setContent('');
      setStatus('');
      load();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      alert('Erro ao excluir documento.');
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <div className="cyber-card space-y-3">
        <h1 className="text-xl font-display text-primary-light">Documentação Pentest</h1>
        <p className="text-sm text-gray-400">Guias OWASP, NIST, API Security e checklists internos.</p>
        <ul className="space-y-2 text-sm text-gray-300">
          {documents.map((doc) => (
            <li key={doc.slug}>
              <button
                className={`w-full rounded border border-slate-800 px-3 py-2 text-left transition hover:border-primary/60 ${
                  selected?.slug === doc.slug ? 'border-primary/70 bg-primary/10 text-primary-light' : ''
                }`}
                onClick={() => handleSelect(doc)}
              >
                <div className="font-medium">{doc.title}</div>
                <div className="text-xs text-gray-500">{doc.category}</div>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="space-y-4">
        {selected ? (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-display text-primary-light">{selected.title}</h2>
              <div className="flex gap-2">
                <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white" onClick={handleSave}>
                  Salvar alterações
                </button>
                <button className="rounded-lg border border-red-500 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/10" onClick={handleDelete}>
                  Excluir
                </button>
              </div>
            </div>
            {status ? <div className="text-sm text-emerald-400">{status}</div> : null}
            <MarkdownEditor value={content} onChange={setContent} />
          </>
        ) : (
          <div className="cyber-card text-gray-400">Selecione um documento para editar</div>
        )}
      </div>
    </div>
  );
}
