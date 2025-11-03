'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const LANGUAGE_STORAGE_KEY = 'appsec-language';
const SUPPORTED = [
  { code: 'pt-BR', label: 'PT' },
  { code: 'en-US', label: 'EN' },
];

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation('common');
  const [current, setCurrent] = useState(i18n.language ?? 'pt-BR');

  useEffect(() => {
    const handler = (lng: string) => setCurrent(lng);
    setCurrent(i18n.language ?? 'pt-BR');
    i18n.on('languageChanged', handler);
    return () => {
      i18n.off('languageChanged', handler);
    };
  }, [i18n]);

  const switchLanguage = (code: string) => {
    void i18n.changeLanguage(code);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
    }
    setCurrent(code);
  };

  return (
    <div className="flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900/60 px-2 py-1 text-xs">
      <span className="px-2 text-gray-400">{t('topbar.language')}</span>
      {SUPPORTED.map((lang) => (
        <button
          key={lang.code}
          onClick={() => switchLanguage(lang.code)}
          className={`rounded-full px-2 py-1 font-semibold transition ${
            current === lang.code ? 'bg-primary text-white shadow-sm' : 'text-gray-300 hover:text-white'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
