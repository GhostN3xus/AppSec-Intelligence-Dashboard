'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { ChartBarIcon, ShieldCheckIcon, AdjustmentsHorizontalIcon, DocumentDuplicateIcon, UserGroupIcon, CpuChipIcon } from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/', icon: ChartBarIcon },
  { name: 'Aplicações', href: '/applications', icon: CpuChipIcon },
  { name: 'Vulnerabilidades', href: '/vulnerabilities', icon: ShieldCheckIcon },
  { name: 'Responsáveis', href: '/responsaveis', icon: UserGroupIcon },
  { name: 'Documentação', href: '/documentacao', icon: DocumentDuplicateIcon },
  { name: 'Templates', href: '/templates', icon: DocumentDuplicateIcon },
  { name: 'Configurações', href: '/configuracoes', icon: AdjustmentsHorizontalIcon },
];

type SidebarProps = {
  variant?: 'desktop' | 'mobile';
  onNavigate?: () => void;
};

export function Sidebar({ variant = 'desktop', onNavigate }: SidebarProps) {
  const pathname = usePathname();

  const baseClasses =
    variant === 'desktop'
      ? 'hidden md:flex md:w-64 md:flex-col border-r border-slate-800 bg-slate-950/80 backdrop-blur'
      : 'flex flex-col border border-slate-800 bg-slate-950/95 backdrop-blur rounded-xl p-2';

  return (
    <aside className={baseClasses}>
      <div
        className={clsx(
          'flex items-center justify-center border-b border-slate-800',
          variant === 'desktop' ? 'h-16' : 'pb-3',
        )}
      >
        <span className="font-display text-xl text-primary-light">AppSec Intelligence</span>
      </div>
      <nav className="flex flex-1 flex-col gap-2 p-4">
        {navigation.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                active ? 'bg-primary/20 text-primary-light' : 'text-gray-400 hover:bg-slate-900 hover:text-white',
              )}
              onClick={onNavigate}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
