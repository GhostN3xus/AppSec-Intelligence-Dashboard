import { VulnerabilityTable } from '../../components/vulnerabilities/vulnerability-table';

export default function DastPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display text-primary-light">Findings DAST (Burp, ZAP, Nessus)</h1>
        <p className="text-sm text-gray-400">
          Consolidação das vulnerabilidades dinâmicas e de infraestrutura com status de SLA.
        </p>
      </div>
      <VulnerabilityTable type="dast" />
    </div>
  );
}
