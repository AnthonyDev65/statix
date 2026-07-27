// =====================================================
// Statix — AnovaPage
// =====================================================
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TableProperties, CheckCircle2, XCircle, Sigma } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Section } from '@/components/Section';
import { StatCard } from '@/components/StatCard';
import { FormulaCard } from '@/components/FormulaCard';
import { ActionBar } from '@/components/ActionBar';
import { ExportButton } from '@/components/ExportButton';
import { HistoryPanel } from '@/components/HistoryPanel';
import { TheoryDocs } from '@/components/TheoryDocs';
import { DataGrid } from '@/components/DataGrid';
import { AnovaTable } from '@/components/AnovaTable';
import { AnovaSteps } from '@/components/AnovaSteps';
import { ANOVA_FORMULAS } from '@/formulas/formulas';
import { useHistory } from '@/context/HistoryContext';
import { formatNumber, formatProbability } from '@/utils/formatters.utils';
import {
  parseGridOneWay, parseGridTwoWay, detectReplication,
} from '@/utils/anova.utils';
import {
  calculateAnovaOneWay, calculateAnovaTwoWay, tukeyHSD,
} from '@/services/statistics.service';
import type { TukeyResult } from '@/types';

type Mode = 'one-way' | 'two-way';
const ALPHA = 0.05;

// Ejemplo por defecto (un factor): 3 grupos
const ONE_WAY_EXAMPLE: string[][] = [
  ['6', '8', '13'],
  ['8', '12', '9'],
  ['4', '9', '11'],
  ['5', '11', '8'],
  ['3', '6', '7'],
  ['4', '8', '12'],
];
const ONE_WAY_COLS = ['Método A', 'Método B', 'Método C'];

// Ejemplo dos factores con repetición (2×2, r=2)
const TWO_WAY_EXAMPLE: string[][] = [
  ['10, 12', '20, 22'],
  ['14, 16', '30, 28'],
];
const TWO_WAY_ROWS = ['A1', 'A2'];
const TWO_WAY_COLS = ['B1', 'B2'];

export function AnovaPage() {
  const { add } = useHistory();
  const [mode, setMode] = useState<Mode>('one-way');

  // Estado de la rejilla (un factor)
  const [grid1, setGrid1] = useState<string[][]>(ONE_WAY_EXAMPLE);
  const [cols1, setCols1] = useState<string[]>(ONE_WAY_COLS);
  const [rows1, setRows1] = useState<string[]>(ONE_WAY_EXAMPLE.map((_, i) => `Obs ${i + 1}`));

  // Estado de la rejilla (dos factores)
  const [grid2, setGrid2] = useState<string[][]>(TWO_WAY_EXAMPLE);
  const [rows2, setRows2] = useState<string[]>(TWO_WAY_ROWS);
  const [cols2, setCols2] = useState<string[]>(TWO_WAY_COLS);

  // ---- Cálculo un factor ----
  const oneWay = useMemo(() => {
    const groups = parseGridOneWay(grid1, cols1).filter((g) => g.values.length > 0);
    if (groups.length < 2 || groups.some((g) => g.values.length < 2)) return null;
    const res = calculateAnovaOneWay(groups, ALPHA);
    const within = res.rows.find((r) => r.source.includes('Dentro'))!;
    const tukey = res.rejectH0
      ? tukeyHSD(groups, within.ms ?? 0, within.df, ALPHA)
      : null;
    return { res, tukey };
  }, [grid1, cols1]);

  // ---- Cálculo dos factores ----
  const twoWay = useMemo(() => {
    const matrix = parseGridTwoWay(grid2);
    // rejilla rectangular y celdas no vacías
    const cols = matrix[0]?.length ?? 0;
    const ok = matrix.length >= 2
      && matrix.every((row) => row.length === cols && row.length >= 2 && row.every((cell) => cell.length >= 1));
    if (!ok) return null;
    const { r } = detectReplication(matrix);
    // exigir réplicas homogéneas
    const homogeneous = matrix.every((row) => row.every((cell) => cell.length === r));
    if (!homogeneous) return null;
    return calculateAnovaTwoWay(matrix, ALPHA, rows2, cols2);
  }, [grid2, rows2, cols2]);

  const onSaveOneWay = () => {
    if (!oneWay) return;
    add({
      type: 'anova',
      title: `ANOVA 1 factor · k=${oneWay.res.k}`,
      summary: `F = ${formatNumber(oneWay.res.fStatistic, 3)}, p = ${formatNumber(oneWay.res.pValue, 4)} · ${oneWay.res.rejectH0 ? 'rechaza H₀' : 'no rechaza H₀'}`,
      inputs: { k: oneWay.res.k, N: oneWay.res.N },
    });
  };
  const onSaveTwoWay = () => {
    if (!twoWay) return;
    add({
      type: 'anova',
      title: `ANOVA 2 factores · ${twoWay.a}×${twoWay.b}${twoWay.hasReplication ? `, r=${twoWay.r}` : ''}`,
      summary: twoWay.hasReplication ? 'Con interacción A×B' : 'Sin repetición (bloques)',
      inputs: { a: twoWay.a, b: twoWay.b, r: twoWay.r },
    });
  };

  const pdfPayload = {
    documentTitle: 'ANOVA · Análisis de la Varianza',
    subtitle: mode === 'one-way' ? 'Un factor' : 'Dos factores',
    meta: mode === 'one-way' && oneWay
      ? [
          { label: 'k', value: String(oneWay.res.k) },
          { label: 'N', value: String(oneWay.res.N) },
          { label: 'F', value: formatNumber(oneWay.res.fStatistic, 4) },
          { label: 'p', value: formatNumber(oneWay.res.pValue, 4) },
        ]
      : twoWay
      ? [
          { label: 'a', value: String(twoWay.a) },
          { label: 'b', value: String(twoWay.b) },
          { label: 'r', value: String(twoWay.r) },
        ]
      : [],
    sections: mode === 'one-way' && oneWay
      ? [{ title: 'Tabla ANOVA', content: oneWay.res.rows.map((r) =>
          `${r.source}: SC=${formatNumber(r.ss, 3)}, gl=${r.df}, CM=${r.ms === null ? '—' : formatNumber(r.ms, 3)}, F=${r.f === null ? '—' : formatNumber(r.f, 3)}`) }]
      : twoWay
      ? [{ title: 'Tabla ANOVA', content: twoWay.rows.map((r) =>
          `${r.source}: SC=${formatNumber(r.ss, 3)}, gl=${r.df}, CM=${r.ms === null ? '—' : formatNumber(r.ms, 3)}, F=${r.f === null ? '—' : formatNumber(r.f, 3)}`) }]
      : [],
  };

  const summary = mode === 'one-way' && oneWay
    ? `ANOVA un factor\nF = ${formatNumber(oneWay.res.fStatistic, 4)}, p = ${formatNumber(oneWay.res.pValue, 4)}\n${oneWay.res.rejectH0 ? 'Se rechaza H₀' : 'No se rechaza H₀'}`
    : '';

  const hasResult = (mode === 'one-way' && !!oneWay) || (mode === 'two-way' && !!twoWay);

  return (
    <div className="space-y-12">
      <PageHeader
        title="ANOVA"
        description="Compara las medias de varios grupos con el análisis de la varianza. Introduce los datos como en una hoja de cálculo y elige uno o dos factores."
        icon={TableProperties}
        badge="inference"
        status={{ label: 'Ready', tone: 'ready' }}
        actions={hasResult && <ExportButton payload={pdfPayload} summary={summary} label="Export" />}
      />

      <div className="inline-flex items-center gap-1 rounded-lg border border-v0-200/30 bg-v0-50 p-1 dark:border-v0-800/30 dark:bg-v0-900">
        <ModeTab active={mode === 'one-way'} onClick={() => setMode('one-way')} label="Un factor" sub="1" />
        <ModeTab active={mode === 'two-way'} onClick={() => setMode('two-way')} label="Dos factores" sub="2" />
      </div>

      <AnimatePresence mode="wait">
        {mode === 'one-way' ? (
          <motion.div key="one" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="space-y-6">
            <Section title="Datos" monospaceTitle description="Cada columna es un grupo. Añade columnas (grupos) y filas (observaciones).">
              <DataGrid
                grid={grid1}
                rowHeaders={rows1}
                colHeaders={cols1}
                showRowHeaders={false}
                onChange={setGrid1}
                onRowHeadersChange={setRows1}
                onColHeadersChange={setCols1}
              />
              <div className="mt-4 border-t border-v0-150/30 pt-4 dark:border-v0-800/30">
                <ActionBar
                  onExample={() => { setGrid1(ONE_WAY_EXAMPLE); setCols1(ONE_WAY_COLS); }}
                  onReset={() => { setGrid1([['', '', '']]); setCols1(['Grupo 1', 'Grupo 2', 'Grupo 3']); }}
                  onSubmit={onSaveOneWay}
                />
              </div>
            </Section>

            {oneWay ? (
              <div className="space-y-6">
                <Section title="Tabla ANOVA" monospaceTitle description="Resultado del análisis">
                  <AnovaTable rows={oneWay.res.rows} />
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <StatCard label="F" value={formatNumber(oneWay.res.fStatistic, 4)} icon={Sigma} description={`F crítico ${formatNumber(oneWay.res.fCritical, 3)}`} />
                    <StatCard label="valor-p" value={formatNumber(oneWay.res.pValue, 4)} icon={Sigma} description={`α = ${formatProbability(ALPHA, 2)}`} />
                    <StatCard label="k / N" value={`${oneWay.res.k} / ${oneWay.res.N}`} icon={Sigma} description="grupos / observaciones" />
                  </div>
                </Section>

                <DecisionCard reject={oneWay.res.rejectH0} />

                {oneWay.tukey && <TukeyCard tukey={oneWay.tukey} />}

                <AnovaSteps result={oneWay.res} />
              </div>
            ) : (
              <EmptyState />
            )}
          </motion.div>
        ) : (
          <motion.div key="two" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="space-y-6">
            <Section title="Datos" monospaceTitle description="Filas = factor A, columnas = factor B. Escribe varias réplicas por celda (coma) para la interacción.">
              <DataGrid
                grid={grid2}
                rowHeaders={rows2}
                colHeaders={cols2}
                showRowHeaders
                rowHeaderLabel="A \ B"
                onChange={setGrid2}
                onRowHeadersChange={setRows2}
                onColHeadersChange={setCols2}
              />
              <div className="mt-4 border-t border-v0-150/30 pt-4 dark:border-v0-800/30">
                <ActionBar
                  onExample={() => { setGrid2(TWO_WAY_EXAMPLE); setRows2(TWO_WAY_ROWS); setCols2(TWO_WAY_COLS); }}
                  onReset={() => { setGrid2([['', ''], ['', '']]); setRows2(['A1', 'A2']); setCols2(['B1', 'B2']); }}
                  onSubmit={onSaveTwoWay}
                />
              </div>
            </Section>

            {twoWay ? (
              <div className="space-y-6">
                <Section title="Tabla ANOVA" monospaceTitle description={twoWay.hasReplication ? `Dos factores con repetición · r = ${twoWay.r}` : 'Dos factores sin repetición (bloques)'}>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-md border border-v0-200/40 px-3 py-1.5 font-mono text-[11px] text-v0-600 dark:border-v0-800/40 dark:text-v0-300">
                    Detectado: {twoWay.a}×{twoWay.b}{twoWay.hasReplication ? `, r = ${twoWay.r} (con interacción)` : ' (sin repetición)'}
                  </div>
                  <AnovaTable rows={twoWay.rows} />
                </Section>
              </div>
            ) : (
              <EmptyState />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Section title="Framework" monospaceTitle description="Fórmulas utilizadas">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {ANOVA_FORMULAS.map((f, i) => (
            <FormulaCard key={f.id} formula={f} index={i} />
          ))}
        </div>
      </Section>

      <TheoryDocs moduleId="anova" />

      <HistoryPanel />
    </div>
  );
}

function ModeTab({ active, onClick, label, sub }: { active: boolean; onClick: () => void; label: string; sub: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex items-center gap-2.5 rounded-md px-4 py-2 text-left transition-all duration-200 ${
        active
          ? 'bg-v0-950 text-v0-50 shadow-soft dark:bg-v0-50 dark:text-v0-950'
          : 'text-v0-500/70 hover:bg-v0-75 hover:text-v0-900 dark:text-v0-300/80 dark:hover:bg-v0-900 dark:hover:text-v0-100'
      }`}
    >
      <span className="font-mono text-[11px] font-medium opacity-70">{sub}</span>
      <span className="text-[13.5px] font-medium">{label}</span>
    </button>
  );
}

function DecisionCard({ reject }: { reject: boolean }) {
  const Icon = reject ? CheckCircle2 : XCircle;
  return (
    <div className={`flex items-center gap-3 rounded-xl border px-5 py-4 ${
      reject
        ? 'border-emerald-500/25 bg-emerald-500/[0.05]'
        : 'border-v0-300/30 bg-v0-100/40 dark:border-v0-700/40 dark:bg-v0-800/30'
    }`}>
      <Icon size={20} strokeWidth={1.9} className={reject ? 'text-emerald-600 dark:text-emerald-400' : 'text-v0-500'} />
      <p className="text-[13.5px] font-medium text-v0-900 dark:text-v0-50">
        {reject
          ? 'Se rechaza H₀: hay evidencia de que al menos una media difiere.'
          : 'No se rechaza H₀: no hay evidencia suficiente de diferencias entre las medias.'}
      </p>
    </div>
  );
}

function TukeyCard({ tukey }: { tukey: TukeyResult }) {
  return (
    <Section title="Post-hoc · Tukey HSD" monospaceTitle description={`Comparaciones por pares (q = ${formatNumber(tukey.q, 3)})`}>
      <div className="overflow-hidden rounded-xl border border-v0-200/30 dark:border-v0-800/30">
        {tukey.comparisons.map((c, i) => (
          <div key={`${c.a}-${c.b}`} className={`flex items-center justify-between px-4 py-3 ${i > 0 ? 'border-t border-v0-150/30 dark:border-v0-800/30' : ''}`}>
            <span className="text-[13px] font-medium text-v0-800 dark:text-v0-100">{c.a} vs {c.b}</span>
            <span className="flex items-center gap-3 font-mono text-[12px] text-v0-600 dark:text-v0-300">
              <span>|Δ| = {formatNumber(c.meanDiff, 3)}</span>
              <span>HSD = {formatNumber(c.hsd, 3)}</span>
              <span className={`rounded px-2 py-0.5 text-[11px] font-semibold ${c.significant ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' : 'bg-v0-100 text-v0-500 dark:bg-v0-800 dark:text-v0-400'}`}>
                {c.significant ? 'significativo' : 'no signif.'}
              </span>
            </span>
          </div>
        ))}
      </div>
    </Section>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-v0-300/20 bg-v0-50 px-6 py-16 text-center dark:border-v0-700/30 dark:bg-v0-900">
      <TableProperties size={22} strokeWidth={1.5} className="text-v0-400/70" />
      <p className="mt-4 text-[14px] font-medium text-v0-900 dark:text-v0-100">Introduce datos válidos</p>
      <p className="mt-1 text-[12.5px] text-v0-500/70">Un factor: ≥ 2 grupos con ≥ 2 datos. Dos factores: rejilla completa ≥ 2×2.</p>
    </div>
  );
}
