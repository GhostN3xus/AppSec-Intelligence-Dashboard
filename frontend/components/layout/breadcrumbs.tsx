'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';

const LABEL_OVERRIDES: Record<string, string> = {
  'admin': 'breadcrumbs.admin',
  'logs': 'breadcrumbs.logs',
  'docs': 'breadcrumbs.docs',
  'about': 'breadcrumbs.about',
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const { t } = useTranslation('common');

  const segments = pathname.split('/').filter(Boolean);

  const items = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const translationKey = LABEL_OVERRIDES[segment] ?? `navigation.${segment}`;
    const label = t(translationKey as any, { defaultValue: segment.replace(/-/g, ' ') });
    return { href, label, isLast: index === segments.length - 1 };
  });

  return (
    <nav className="mb-6 flex items-center text-xs text-gray-400" aria-label="Breadcrumb">
      <Link href="/home" className="flex items-center gap-1 text-gray-300 transition hover:text-primary-light">
        <HomeIcon className="h-4 w-4" />
        {t('breadcrumbs.home')}
      </Link>
      {items.map((item) => (
        <span key={item.href} className="flex items-center">
          <ChevronRightIcon className="mx-2 h-3.5 w-3.5 text-slate-600" />
          {item.isLast ? (
            <span className="font-medium text-gray-200">{item.label}</span>
          ) : (
            <Link
              href={item.href}
              className={clsx('text-gray-400 transition hover:text-primary-light')}
            >
              {item.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
