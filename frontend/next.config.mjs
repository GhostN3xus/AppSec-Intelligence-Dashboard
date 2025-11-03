import nextI18NextConfig from './next-i18next.config.js';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: {
    appDir: true,
  },
  images: {
    unoptimized: true,
  },
  i18n: nextI18NextConfig.i18n,
};

export default nextConfig;
