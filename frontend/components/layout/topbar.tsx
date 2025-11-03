'use client';

import { Bars3Icon, MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import { Sidebar } from './sidebar';

export function Topbar() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark' || theme === undefined;
  const [menuOpen, setMenuOpen] = useState(false);

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
        <div className="text-sm text-gray-400">admin@appsec.local</div>
      </div>
      {menuOpen ? (
        <div className="absolute left-0 top-16 w-full p-4 md:hidden">
          <Sidebar variant="mobile" onNavigate={() => setMenuOpen(false)} />
        </div>
      ) : null}
    </header>
  );
}
