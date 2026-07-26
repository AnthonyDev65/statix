// =====================================================
// Statix — DataGrid (editor de datos tipo hoja de cálculo)
// =====================================================
import { Plus, Trash2 } from 'lucide-react';

export interface DataGridProps {
  grid: string[][];                 // grid[fila][col]
  rowHeaders: string[];
  colHeaders: string[];
  showRowHeaders?: boolean;         // ocultar en modo un factor si se desea
  rowHeaderLabel?: string;          // encabezado de la esquina
  onChange: (grid: string[][]) => void;
  onRowHeadersChange: (h: string[]) => void;
  onColHeadersChange: (h: string[]) => void;
}

export function DataGrid({
  grid, rowHeaders, colHeaders, showRowHeaders = true, rowHeaderLabel = '',
  onChange, onRowHeadersChange, onColHeadersChange,
}: DataGridProps) {
  const rows = grid.length;
  const cols = colHeaders.length;

  const setCell = (r: number, c: number, value: string) => {
    const next = grid.map((row) => row.slice());
    next[r][c] = value;
    onChange(next);
  };

  const addColumn = () => {
    const next = grid.map((row) => [...row, '']);
    onChange(next);
    onColHeadersChange([...colHeaders, `Grupo ${cols + 1}`]);
  };
  const removeColumn = () => {
    if (cols <= 1) return;
    const next = grid.map((row) => row.slice(0, -1));
    onChange(next);
    onColHeadersChange(colHeaders.slice(0, -1));
  };
  const addRow = () => {
    onChange([...grid, Array(cols).fill('')]);
    onRowHeadersChange([...rowHeaders, `Nivel ${rows + 1}`]);
  };
  const removeRow = () => {
    if (rows <= 1) return;
    onChange(grid.slice(0, -1));
    onRowHeadersChange(rowHeaders.slice(0, -1));
  };

  const inputCls =
    'w-full rounded-md border border-v0-200/40 bg-v0-50 px-2 py-1.5 text-center font-mono text-[12.5px] text-v0-900 outline-none transition focus:border-v0-950 dark:border-v0-800/40 dark:bg-v0-950 dark:text-v0-100 dark:focus:border-v0-50';
  const headCls =
    'w-full rounded-md border border-transparent bg-transparent px-2 py-1 text-center text-[12px] font-semibold text-v0-700 outline-none focus:border-v0-300 dark:text-v0-200 dark:focus:border-v0-700';

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-v0-200/30 bg-v0-50 p-3 dark:border-v0-800/30 dark:bg-v0-900">
        <table className="w-full border-separate border-spacing-1">
          <thead>
            <tr>
              {showRowHeaders && (
                <th className="w-24 px-1 text-left font-mono text-[10.5px] uppercase tracking-[0.06em] text-v0-400/70">
                  {rowHeaderLabel}
                </th>
              )}
              {colHeaders.map((h, c) => (
                <th key={c} className="min-w-[92px] px-0.5">
                  <input
                    aria-label={`Encabezado columna ${c + 1}`}
                    value={h}
                    onChange={(e) => {
                      const next = colHeaders.slice();
                      next[c] = e.target.value;
                      onColHeadersChange(next);
                    }}
                    className={headCls}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.map((row, r) => (
              <tr key={r}>
                {showRowHeaders && (
                  <td className="px-0.5">
                    <input
                      aria-label={`Encabezado fila ${r + 1}`}
                      value={rowHeaders[r] ?? ''}
                      onChange={(e) => {
                        const next = rowHeaders.slice();
                        next[r] = e.target.value;
                        onRowHeadersChange(next);
                      }}
                      className={headCls + ' text-left'}
                    />
                  </td>
                )}
                {row.map((cell, c) => (
                  <td key={c} className="px-0.5">
                    <input
                      inputMode="decimal"
                      aria-label={`Celda fila ${r + 1} columna ${c + 1}`}
                      value={cell}
                      onChange={(e) => setCell(r, c, e.target.value)}
                      className={inputCls}
                      placeholder="—"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <GridButton onClick={addColumn} icon={Plus} label="Columna" />
        <GridButton onClick={removeColumn} icon={Trash2} label="Columna" tone="danger" />
        <span className="mx-1 h-4 w-px bg-v0-200/50 dark:bg-v0-800/50" />
        <GridButton onClick={addRow} icon={Plus} label="Fila" />
        <GridButton onClick={removeRow} icon={Trash2} label="Fila" tone="danger" />
      </div>
    </div>
  );
}

function GridButton({
  onClick, icon: Icon, label, tone = 'default',
}: {
  onClick: () => void;
  icon: typeof Plus;
  label: string;
  tone?: 'default' | 'danger';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[12px] font-medium transition-all active:scale-[0.97] ${
        tone === 'danger'
          ? 'border-v0-200/40 text-v0-500 hover:border-red-400/50 hover:text-red-500 dark:border-v0-800/40 dark:text-v0-400'
          : 'border-v0-200/40 text-v0-700 hover:border-v0-950 hover:text-v0-950 dark:border-v0-800/40 dark:text-v0-200 dark:hover:border-v0-50 dark:hover:text-v0-50'
      }`}
    >
      <Icon size={13} strokeWidth={1.9} />
      {label}
    </button>
  );
}
