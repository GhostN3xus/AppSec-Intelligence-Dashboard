interface Props {
  applications: any[];
}

export function TopApplications({ applications }: Props) {
  return (
    <div className="cyber-card">
      <h3 className="text-lg font-display text-primary-light">Top 10 Aplicações Críticas</h3>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-wider text-gray-400">
            <tr>
              <th className="py-2">Aplicação</th>
              <th className="py-2">Responsável</th>
              <th className="py-2">Vulns Críticas/Altas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {applications.map((app) => (
              <tr key={app.id}>
                <td className="py-3 font-medium text-white">{app.name}</td>
                <td className="py-3 text-gray-400">{app.responsible?.name ?? 'N/A'}</td>
                <td className="py-3 text-primary-light">{app.criticalCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
