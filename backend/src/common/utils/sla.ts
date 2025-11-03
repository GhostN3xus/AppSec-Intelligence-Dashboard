export const SLA_DEADLINES: Record<string, number> = {
  critical: 7,
  high: 15,
  medium: 30,
  low: 60,
};

export type SeverityLevel = keyof typeof SLA_DEADLINES;

export function calculateDueDate(severity: SeverityLevel, detectedAt: Date) {
  const days = SLA_DEADLINES[severity] ?? SLA_DEADLINES.medium;
  const dueDate = new Date(detectedAt);
  dueDate.setDate(dueDate.getDate() + days);
  return dueDate;
}

export function getSlaStatus(dueDate: Date) {
  const now = new Date();
  if (dueDate.getTime() < now.getTime()) {
    return 'overdue';
  }
  const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 3) {
    return 'at-risk';
  }
  return 'on-track';
}
