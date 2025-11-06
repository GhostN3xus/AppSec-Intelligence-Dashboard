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
  BeakerIcon,
  LinkIcon,
  HomeIcon,
  DocumentMagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../store/auth-store';
import { useTranslation } from 'react-i18next';

type NavigationItem = {
  labelKey: string;
  fallback: string;
  href: string;
  icon: typeof ChartBarIcon;
  roles?: string[];
};

const navigation: NavigationItem[] = [
  { labelKey: 'navigation.dashboard', fallback: 'Dashboard', href: '/dashboard', icon: ChartBarIcon },
  { labelKey: 'navigation.inventory', fallback: 'Inventário', href: '/inventory', icon: ClipboardDocumentCheckIcon },
  { labelKey: 'navigation.applications', fallback: 'Aplicações', href: '/applications', icon: CpuChipIcon },
  { labelKey: 'navigation.responsibles', fallback: 'Responsáveis', href: '/responsaveis', icon: UserGroupIcon },
  { labelKey: 'navigation.domains', fallback: 'Domínios', href: '/domains', icon: GlobeAltIcon },
  { labelKey: 'navigation.adminUsers', fallback: 'Admin Usuários', href: '/admin/users', icon: AdjustmentsHorizontalIcon, roles: ['admin'] },
  { labelKey: 'navigation.sast', fallback: 'SAST', href: '/sast', icon: ShieldCheckIcon },
  { labelKey: 'navigation.sca', fallback: 'SCA', href: '/sast/sca', icon: BeakerIcon },
  { labelKey: 'navigation.dast', fallback: 'DAST', href: '/dast', icon: BoltIcon },
  { labelKey: 'navigation.sla', fallback: 'SLA', href: '/sla', icon: ClockIcon },
  { labelKey: 'navigation.vulnerabilities', fallback: 'Vulnerabilidades', href: '/vulnerabilities', icon: ShieldCheckIcon },
  { labelKey: 'navigation.reports', fallback: 'Relatórios', href: '/templates', icon: DocumentDuplicateIcon },
  { labelKey: 'navigation.wordEditor', fallback: 'Editor Word', href: '/editor', icon: DocumentTextIcon },
  { labelKey: 'navigation.excelEditor', fallback: 'Editor Excel', href: '/planilhas', icon: TableCellsIcon },
  { labelKey: 'navigation.documentation', fallback: 'Documentação', href: '/docs', icon: BookOpenIcon },
  { labelKey: 'navigation.aiAssistant', fallback: 'IA Assistant', href: '/ia', icon: SparklesIcon },
  { labelKey: 'navigation.integrations', fallback: 'Integrações', href: '/integrations', icon: LinkIcon, roles: ['admin'] },
  { labelKey: 'navigation.adminLogs', fallback: 'Logs de Auditoria', href: '/admin/logs', icon: DocumentMagnifyingGlassIcon, roles: ['admin'] },
  { labelKey: 'navigation.profile', fallback: 'Perfil', href: '/perfil', icon: UserCircleIcon },
  { labelKey: 'navigation.settings', fallback: 'Configurações', href: '/configuracoes', icon: Cog6ToothIcon },
];

type SidebarProps = {
  variant?: 'desktop' | 'mobile';
  onNavigate?: () => void;
};

export function Sidebar({ variant = 'desktop', onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const role = useAuthStore((state) => state.user?.role);
  const { t } = useTranslation('common');

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
          const label = t(item.labelKey as any, { defaultValue: item.fallback });
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                active ? 'bg-primary/20 text-primary-light' : 'text-gray-400 hover:bg-slate-900 hover:text-white',
              )}
              onClick={onNavigate}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
