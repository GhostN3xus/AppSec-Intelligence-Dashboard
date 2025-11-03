'use client';

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function SeverityChart({ data }: { data: Record<string, number> }) {
  const labels = Object.keys(data);
  const dataset = labels.map((label) => data[label]);
  return (
    <div className="cyber-card">
      <h3 className="text-lg font-display text-primary-light">Severidade das Vulnerabilidades</h3>
      <Bar
        data={{
          labels,
          datasets: [
            {
              label: 'Quantidade',
              data: dataset,
              backgroundColor: ['#ef4444', '#f97316', '#facc15', '#22d3ee'],
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: {
            legend: { labels: { color: 'rgba(226,232,240,0.8)' } },
            title: { display: false },
          },
          scales: {
            x: { ticks: { color: 'rgba(148,163,184,0.9)' } },
            y: { ticks: { color: 'rgba(148,163,184,0.9)' } },
          },
        }}
      />
    </div>
  );
}
