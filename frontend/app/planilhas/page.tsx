'use client';

import { ChangeEvent, useRef, useState } from 'react';
import * as XLSX from 'xlsx';

export default function PlanilhasPage() {
  const [data, setData] = useState<string[][]>([
    ['Aplicação', 'Responsável', 'Severidade', 'SLA', 'Status', 'Total Vulnerabilidades'],
  ]);
  const fileInput = useRef<HTMLInputElement | null>(null);

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    setData((prev) => {
      const clone = prev.map((row) => [...row]);
      clone[rowIndex][colIndex] = value;
      return clone;
    });
  };

  const addRow = () => setData((prev) => [...prev, new Array(prev[0].length).fill('')]);
  const addColumn = () => setData((prev) => prev.map((row) => [...row, '']));

  const handleExport = () => {
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventario AppSec');
    XLSX.writeFile(workbook, 'inventario-appsec.xlsx');
  };

  const handleImport = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = e.target?.result;
      if (!arrayBuffer) return;
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1 });
      setData(json as string[][]);
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display text-primary-light">Excel Studio AppSec</h1>
          <p className="text-sm text-gray-400">Monte planilhas colaborativas para inventários, SLAs e correlações de vulnerabilidades.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={addRow} className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-medium uppercase tracking-wide text-gray-200 hover:border-primary hover:text-primary">
            Adicionar linha
          </button>
          <button onClick={addColumn} className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-medium uppercase tracking-wide text-gray-200 hover:border-primary hover:text-primary">
            Adicionar coluna
          </button>
          <button onClick={handleExport} className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:brightness-110">
            Baixar planilha consolidada
          </button>
          <button
            onClick={() => fileInput.current?.click()}
            className="rounded-lg border border-primary/60 px-4 py-2 text-xs font-medium uppercase tracking-wide text-primary hover:bg-primary/10"
          >
            Upload planilha
          </button>
          <input ref={fileInput} type="file" accept=".xlsx,.csv" className="hidden" onChange={handleImport} />
        </div>
      </div>
      <div className="overflow-auto rounded-xl border border-slate-800 bg-slate-950/40 p-4 shadow-inner">
        <table className="min-w-full border-collapse text-sm">
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, colIndex) => (
                  <td key={colIndex} className="border border-slate-800">
                    <input
                      value={cell ?? ''}
                      onChange={(event) => updateCell(rowIndex, colIndex, event.target.value)}
                      className="w-48 border-none bg-transparent px-3 py-2 text-xs text-gray-100 focus:outline-none"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
