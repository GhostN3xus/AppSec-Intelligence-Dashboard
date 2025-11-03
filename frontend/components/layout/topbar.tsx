'use client';

import { Bars3Icon, MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sidebar } from './sidebar';
import { useAuthStore } from '../../store/auth-store';

export function Topbar() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark' || theme === undefined;
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, hydrate, logout } = useAuthStore();

  useEffect(() => {
    hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-800 bg-slate-950/70 p-4 backdrop-blur">
      <div className="flex items-center gap-3">
        <button className="md:hidden" onClick={() => setMenuOpen((open) => !open)}>
          <Bars3Icon className="h-6 w-6 text-gray-300" />
        </button>
        <div className="font-display text-lg text-primary-light">Befly Cyber Defense</div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          className="rounded-full border border-slate-700 p-2 text-gray-300 hover:bg-slate-900"
        >
          {isDark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
        </button>
        {user ? (
          <div className="flex flex-col text-right text-xs text-gray-400">
            <span className="font-medium text-white">{user.name}</span>
            <span>{user.email}</span>
          </div>
        ) : (
          <div className="text-sm text-gray-400">Convidado</div>
        )}
        {user ? (
          <button
            onClick={() => {
              void logout();
            }}
            className="rounded-lg border border-slate-700 px-3 py-1 text-xs font-medium uppercase tracking-wide text-gray-300 hover:border-primary hover:text-primary"
          >
            Sair
          </button>
        ) : null}
      </div>
      {menuOpen ? (
        <div className="absolute left-0 top-16 w-full p-4 md:hidden">
          <Sidebar variant="mobile" onNavigate={() => setMenuOpen(false)} />
        </div>
      ) : null}
    </header>
  );
}
