import { createInstance, i18n as I18nInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { resources, defaultLocale } from './resources';

let clientInstance: I18nInstance | null = null;
let initPromise: Promise<I18nInstance> | null = null;

export function getI18n() {
  if (!clientInstance) {
    const instance = createInstance();
    initPromise = instance
      .use(initReactI18next)
      .init({
        resources,
        lng: defaultLocale,
        fallbackLng: defaultLocale,
        defaultNS: 'common',
        interpolation: { escapeValue: false },
      })
      .then(() => instance);
    clientInstance = instance;
  }
  return { instance: clientInstance, promise: initPromise! };
}
