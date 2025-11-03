import { VulnerabilityTable } from '../../components/vulnerabilities/vulnerability-table';

export default function SastPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display text-primary-light">Findings SAST (Semgrep)</h1>
        <p className="text-sm text-gray-400">
          Mapeamento das vulnerabilidades estáticas importadas de pipelines Semgrep com classificação automática.
        </p>
      </div>
      <VulnerabilityTable type="sast" />
    </div>
  );
}
