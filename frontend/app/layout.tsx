import './globals.css';
import type { Metadata } from 'next';
import { Sidebar } from '../components/layout/sidebar';
import { Topbar } from '../components/layout/topbar';
import { AppProviders } from '../providers/app-providers';
import { Breadcrumbs } from '../components/layout/breadcrumbs';

export const metadata: Metadata = {
  title: 'AppSec Intelligence Dashboard',
  description: 'Painel unificado para equipes AppSec',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br" suppressHydrationWarning>
      <body>
        <AppProviders>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex flex-1 flex-col">
              <Topbar />
              <main className="flex-1 space-y-6 p-6">
                <Breadcrumbs />
                {children}
              </main>
            </div>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
