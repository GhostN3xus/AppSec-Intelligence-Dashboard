const config = {
  i18n: {
    defaultLocale: 'pt-BR',
    locales: ['pt-BR', 'en-US'],
    localeDetection: true,
  },
  reloadOnPrerender: process.env.NODE_ENV === 'development',
};

export default config;
