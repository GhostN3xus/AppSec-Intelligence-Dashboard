import './globals.css';
import type { Metadata } from 'next';
import { AppProviders } from '../providers/app-providers';
import { LayoutWrapper } from '../components/layout/layout-wrapper';

export const metadata: Metadata = {
  title: 'AppSec Intelligence Dashboard',
  description: 'Painel unificado para equipes AppSec',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br" suppressHydrationWarning>
      <body>
        <AppProviders>
          <LayoutWrapper>{children}</LayoutWrapper>
        </AppProviders>
      </body>
    </html>
  );
}
