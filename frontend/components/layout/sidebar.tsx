'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import {
  ChartBarIcon,
  ShieldCheckIcon,
  AdjustmentsHorizontalIcon,
  DocumentDuplicateIcon,
  UserGroupIcon,
  CpuChipIcon,
  GlobeAltIcon,
  SparklesIcon,
  DocumentTextIcon,
  TableCellsIcon,
  BookOpenIcon,
  ClockIcon,
  ClipboardDocumentCheckIcon,
  BoltIcon,
  UserCircleIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../store/auth-store';

type NavigationItem = {
  name: string;
  href: string;
  icon: typeof ChartBarIcon;
  roles?: string[];
};

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: ChartBarIcon },
  { name: 'Inventário', href: '/inventory', icon: ClipboardDocumentCheckIcon },
  { name: 'Aplicações', href: '/applications', icon: CpuChipIcon },
  { name: 'Responsáveis', href: '/responsaveis', icon: UserGroupIcon },
  { name: 'Domínios', href: '/domains', icon: GlobeAltIcon },
  { name: 'Admin Usuários', href: '/admin/users', icon: AdjustmentsHorizontalIcon, roles: ['admin'] },
  { name: 'SAST', href: '/sast', icon: ShieldCheckIcon },
  { name: 'DAST', href: '/dast', icon: BoltIcon },
  { name: 'SLA', href: '/sla', icon: ClockIcon },
  { name: 'Relatórios', href: '/templates', icon: DocumentDuplicateIcon },
  { name: 'Editor Word', href: '/editor', icon: DocumentTextIcon },
  { name: 'Editor Excel', href: '/planilhas', icon: TableCellsIcon },
  { name: 'Documentações OWASP', href: '/documentacao', icon: BookOpenIcon },
  { name: 'IA Assistant', href: '/ia', icon: SparklesIcon },
  { name: 'Perfil', href: '/perfil', icon: UserCircleIcon },
  { name: 'Configurações', href: '/configuracoes', icon: Cog6ToothIcon },
];

type SidebarProps = {
  variant?: 'desktop' | 'mobile';
  onNavigate?: () => void;
};

export function Sidebar({ variant = 'desktop', onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const role = useAuthStore((state) => state.user?.role);

  const baseClasses =
    variant === 'desktop'
      ? 'hidden md:flex md:w-64 md:flex-col border-r border-slate-800 bg-slate-950/80 backdrop-blur'
      : 'flex flex-col border border-slate-800 bg-slate-950/95 backdrop-blur rounded-xl p-2';

  const items = navigation.filter((item) => {
    if (!item.roles) return true;
    if (!role) return false;
    return item.roles.includes(role);
  });

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
        {items.map((item) => {
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
