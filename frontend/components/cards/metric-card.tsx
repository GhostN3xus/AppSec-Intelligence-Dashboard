import { ReactNode } from 'react';

interface Props {
  title: string;
  value: ReactNode;
  description?: string;
}

export function MetricCard({ title, value, description }: Props) {
  return (
    <div className="cyber-card">
      <div className="text-sm uppercase tracking-wide text-gray-400">{title}</div>
      <div className="mt-2 text-3xl font-display text-primary-light">{value}</div>
      {description ? <div className="mt-1 text-xs text-gray-500">{description}</div> : null}
    </div>
  );
}
