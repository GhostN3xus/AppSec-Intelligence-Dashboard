import fs from 'fs/promises';
import path from 'path';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { resources, defaultLocale, SupportedLocale } from '../../../lib/i18n/resources';

type DocDefinition = {
  slug: string;
  filename: string;
  titles: Record<SupportedLocale, string>;
};

const DOCS: DocDefinition[] = [
  {
    slug: 'instalacao',
    filename: 'instalacao.md',
    titles: {
      'pt-BR': 'Instalação e Setup',
      'en-US': 'Setup & Installation',
    },
  },
  {
    slug: 'guia-sast',
    filename: 'guia-sast.md',
    titles: {
      'pt-BR': 'Guia SAST e SCA',
      'en-US': 'SAST & SCA Guide',
    },
  },
  {
    slug: 'relatorios',
    filename: 'relatorios.md',
    titles: {
      'pt-BR': 'Relatórios OWASP/MSTG',
      'en-US': 'OWASP/MSTG Reports',
    },
  },
];

async function loadDoc(slug: string) {
  const doc = DOCS.find((item) => item.slug === slug);
  if (!doc) {
    return null;
  }
  const baseDir = path.join(process.cwd(), 'docs');
  const filePath = path.join(baseDir, doc.filename);
  const [content, stats] = await Promise.all([fs.readFile(filePath, 'utf-8'), fs.stat(filePath)]);
  return { ...doc, content, updatedAt: stats.mtime.toISOString() };
}

export async function generateStaticParams() {
  return DOCS.map((doc) => ({ slug: doc.slug }));
}

export default async function DocPage({ params }: { params: { slug: string } }) {
  const doc = await loadDoc(params.slug);
  if (!doc) {
    notFound();
  }

  const localeCookie = cookies().get('NEXT_LOCALE')?.value as SupportedLocale | undefined;
  const locale = localeCookie && resources[localeCookie] ? localeCookie : defaultLocale;
  const dictionary = resources[locale].common;

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
      <aside className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">{dictionary.docs.title}</h2>
        <nav className="flex flex-col gap-2">
          {DOCS.map((item) => (
            <Link
              key={item.slug}
              href={`/docs/${item.slug}`}
              className={`rounded-lg border px-3 py-2 text-sm transition ${
                item.slug === doc.slug
                  ? 'border-primary/60 bg-primary/20 text-primary-light'
                  : 'border-slate-800 bg-slate-950/40 text-gray-300 hover:border-primary/60 hover:text-white'
              }`}
            >
              {item.titles[locale]}
            </Link>
          ))}
        </nav>
      </aside>
      <article className="space-y-6">
        <div>
          <h1 className="text-3xl font-display text-primary-light">{doc.titles[locale]}</h1>
          <p className="text-sm text-gray-400">{dictionary.docs.subtitle}</p>
          <p className="text-xs uppercase tracking-wide text-gray-500">
            {dictionary.docs.updated} {new Date(doc.updatedAt).toLocaleString()}
          </p>
        </div>
        <div className="prose prose-invert max-w-none">
          <ReactMarkdown>{doc.content}</ReactMarkdown>
        </div>
      </article>
    </div>
  );
}
