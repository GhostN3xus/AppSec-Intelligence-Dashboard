'use client';

import { ReactNode, useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import { getI18n } from '../lib/i18n/client';
import { useAuthStore } from '../store/auth-store';

const LANGUAGE_STORAGE_KEY = 'appsec-language';

export function I18nProvider({ children }: { children: ReactNode }) {
  const { instance, promise } = getI18n();
  const userLanguage = useAuthStore((state) => state.user?.language);

  useEffect(() => {
    if (!promise) return;
    void promise.then(() => {
      const stored = typeof window !== 'undefined' ? localStorage.getItem(LANGUAGE_STORAGE_KEY) : null;
      const initial = userLanguage ?? stored ?? instance.language;
      if (initial && instance.language !== initial) {
        void instance.changeLanguage(initial);
      }
    });
  }, [instance, promise, userLanguage]);

  useEffect(() => {
    if (!userLanguage) return;
    if (!promise) return;
    void promise.then(() => {
      if (instance.language !== userLanguage) {
        void instance.changeLanguage(userLanguage);
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, userLanguage);
      }
    });
  }, [instance, promise, userLanguage]);

  useEffect(() => {
    if (!promise) return () => undefined;
    const handler = (event: StorageEvent) => {
      if (event.key === LANGUAGE_STORAGE_KEY && event.newValue) {
        void promise.then(() => {
          if (instance.language !== event.newValue) {
            void instance.changeLanguage(event.newValue);
          }
        });
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handler);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handler);
      }
    };
  }, [instance, promise]);

  return <I18nextProvider i18n={instance}>{children}</I18nextProvider>;
}
