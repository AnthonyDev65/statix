// =====================================================
// Statix — Utilidades de parseo de la rejilla ANOVA
// =====================================================
import type { LabeledGroup } from '@/services/statistics.service';

/** Convierte el texto de una celda en una lista de números (coma o espacio). */
export function parseCell(text: string): number[] {
  if (!text) return [];
  return text
    .split(/[,\s]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0)
    .map((t) => Number(t))
    .filter((n) => Number.isFinite(n));
}

/** Un factor: cada columna es un grupo; se aplanan los valores de sus celdas. */
export function parseGridOneWay(grid: string[][], colLabels: string[]): LabeledGroup[] {
  const cols = grid[0]?.length ?? 0;
  const groups: LabeledGroup[] = [];
  for (let c = 0; c < cols; c++) {
    const values: number[] = [];
    for (let rIdx = 0; rIdx < grid.length; rIdx++) {
      values.push(...parseCell(grid[rIdx][c] ?? ''));
    }
    groups.push({ label: colLabels[c] ?? `Grupo ${c + 1}`, values });
  }
  return groups;
}

/** Dos factores: matrix[fila][col] = lista de réplicas de esa celda. */
export function parseGridTwoWay(grid: string[][]): number[][][] {
  return grid.map((row) => row.map((cell) => parseCell(cell ?? '')));
}

/** Detecta si hay repetición (r>1) mirando el nº de valores por celda. */
export function detectReplication(matrix: number[][][]): { replication: boolean; r: number } {
  let maxLen = 0;
  let minLen = Infinity;
  matrix.forEach((row) => row.forEach((cell) => {
    maxLen = Math.max(maxLen, cell.length);
    minLen = Math.min(minLen, cell.length);
  }));
  const r = maxLen;
  return { replication: r > 1, r };
}
