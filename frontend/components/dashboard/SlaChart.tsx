'use client';

import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function SlaChart({ data }) {
  const chartData = {
    labels: ['Vencido', 'Em Risco', 'No Prazo'],
    datasets: [
      {
        data: [data.overdue, data.atRisk, data.onTime],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(255, 205, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
        ],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(255, 205, 86)',
          'rgb(75, 192, 192)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Status de SLA',
      },
    },
  };

  return <Pie data={chartData} options={options} />;
}
