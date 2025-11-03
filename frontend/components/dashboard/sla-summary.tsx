interface Props {
  summary: { overdue: number; atRisk: number; onTrack: number };
}

export function SlaSummary({ summary }: Props) {
  return (
    <div className="cyber-card">
      <h3 className="text-lg font-display text-primary-light">Status de SLA</h3>
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-display text-red-400">{summary.overdue}</div>
          <div className="text-xs uppercase text-gray-400">Vencidas</div>
        </div>
        <div>
          <div className="text-2xl font-display text-amber-300">{summary.atRisk}</div>
          <div className="text-xs uppercase text-gray-400">Em risco</div>
        </div>
        <div>
          <div className="text-2xl font-display text-emerald-300">{summary.onTrack}</div>
          <div className="text-xs uppercase text-gray-400">No prazo</div>
        </div>
      </div>
    </div>
  );
}
