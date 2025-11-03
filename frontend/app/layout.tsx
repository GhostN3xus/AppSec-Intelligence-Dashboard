import './globals.css';
import type { Metadata } from 'next';
import { Sidebar } from '../components/layout/sidebar';
import { Topbar } from '../components/layout/topbar';
import { ThemeProvider } from '../providers/theme-provider';

export const metadata: Metadata = {
  title: 'AppSec Intelligence Dashboard',
  description: 'Painel unificado para equipes AppSec',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex flex-1 flex-col">
              <Topbar />
              <main className="flex-1 p-6">{children}</main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
