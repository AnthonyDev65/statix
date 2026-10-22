// =====================================================
// Statix — AnovaPage
// =====================================================
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TableProperties, CheckCircle2, XCircle, Sigma } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { EmptyResult } from '@/components/Panel';
import { Section } from '@/components/Section';
import { StatCard } from '@/components/StatCard';
import { FormulaCard } from '@/components/FormulaCard';
import { ActionBar } from '@/components/ActionBar';
import { ExportButton } from '@/components/ExportButton';
import { HistoryPanel } from '@/components/HistoryPanel';
import { TheoryDocs } from '@/components/TheoryDocs';
import { AdvancedOnly } from '@/components/AdvancedOnly';
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
        actions={hasResult && <ExportButton payload={pdfPayload} summary={summary} label="Exportar" />}
      />

      <div role="tablist" aria-label="Número de factores" className="inline-flex items-center gap-1 rounded-lg bg-v0-100 p-1 dark:bg-v0-900">
        <ModeTab active={mode === 'one-way'} onClick={() => setMode('one-way')} label="Un factor" sub="1" />
        <ModeTab active={mode === 'two-way'} onClick={() => setMode('two-way')} label="Dos factores" sub="2" />
      </div>

      <AnimatePresence mode="wait">
        {mode === 'one-way' ? (
          <motion.div key="one" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="space-y-6">
            <Section title="Datos" alwaysShowHeader description="Cada columna es un grupo. Añade columnas (grupos) y filas (observaciones).">
              <DataGrid
                grid={grid1}
                rowHeaders={rows1}
                colHeaders={cols1}
                showRowHeaders={false}
                onChange={setGrid1}
                onRowHeadersChange={setRows1}
                onColHeadersChange={setCols1}
              />
              <div className="mt-4">
                <ActionBar
                  onExample={() => { setGrid1(ONE_WAY_EXAMPLE); setCols1(ONE_WAY_COLS); }}
                  onReset={() => { setGrid1([['', '', '']]); setCols1(['Grupo 1', 'Grupo 2', 'Grupo 3']); }}
                  onSubmit={onSaveOneWay}
                />
              </div>
            </Section>

            {oneWay ? (
              <div className="space-y-6">
                <Section title="Tabla ANOVA" alwaysShowHeader description="Cómo se reparte la variabilidad entre los grupos y dentro de ellos.">
                  <AnovaTable rows={oneWay.res.rows} />
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <StatCard label="Estadístico F" value={formatNumber(oneWay.res.fStatistic, 4)} icon={Sigma} description={`Se compara con F crítico = ${formatNumber(oneWay.res.fCritical, 3)}`} />
                    <StatCard label="Valor p" value={formatNumber(oneWay.res.pValue, 4)} icon={Sigma} description={`Si es menor que α = ${formatProbability(ALPHA, 0)}, hay diferencias`} />
                    <StatCard label="Grupos y datos" value={`${oneWay.res.k} / ${oneWay.res.N}`} icon={Sigma} description="k grupos / N observaciones" />
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
            <Section title="Datos" alwaysShowHeader description="Filas = factor A, columnas = factor B. Escribe varias réplicas por celda (coma) para la interacción.">
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
              <div className="mt-4">
                <ActionBar
                  onExample={() => { setGrid2(TWO_WAY_EXAMPLE); setRows2(TWO_WAY_ROWS); setCols2(TWO_WAY_COLS); }}
                  onReset={() => { setGrid2([['', ''], ['', '']]); setRows2(['A1', 'A2']); setCols2(['B1', 'B2']); }}
                  onSubmit={onSaveTwoWay}
                />
              </div>
            </Section>

            {twoWay ? (
              <div className="space-y-6">
                <Section title="Tabla ANOVA" alwaysShowHeader description={twoWay.hasReplication ? `Dos factores con repetición · r = ${twoWay.r}` : 'Dos factores sin repetición (bloques)'}>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-md bg-v0-100 px-3 py-1.5 text-[14px] text-v0-700 dark:bg-v0-800 dark:text-v0-200">
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

      <AdvancedOnly>
        <Section title="Fórmulas" divider description="Fórmulas utilizadas">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {ANOVA_FORMULAS.map((f, i) => (
              <FormulaCard key={f.id} formula={f} index={i} />
            ))}
          </div>
        </Section>

        <TheoryDocs moduleId="anova" />

        <HistoryPanel />
      </AdvancedOnly>
    </div>
  );
}

function ModeTab({ active, onClick, label, sub }: { active: boolean; onClick: () => void; label: string; sub: string }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`flex min-h-[40px] items-center gap-2 rounded-md px-4 text-left transition-colors duration-150 ${
        active
          ? 'bg-v0-950 text-v0-50 dark:bg-v0-50 dark:text-v0-950'
          : 'text-v0-700 hover:bg-v0-150 hover:text-v0-950 dark:text-v0-200 dark:hover:bg-v0-800 dark:hover:text-v0-50'
      }`}
    >
      <span className="text-[15px] font-semibold">{label}</span>
      <span className="sr-only">{sub}</span>
    </button>
  );
}

function DecisionCard({ reject }: { reject: boolean }) {
  const Icon = reject ? CheckCircle2 : XCircle;
  return (
    <div
      role="status"
      className={`flex items-start gap-3 rounded-lg px-5 py-4 ${
        reject
          ? 'bg-v0-950 text-v0-50 dark:bg-v0-50 dark:text-v0-950'
          : 'bg-v0-100 text-v0-900 dark:bg-v0-800 dark:text-v0-50'
      }`}
    >
      <Icon size={22} strokeWidth={1.9} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
      <div>
        <p className="text-[17px] font-semibold">
          {reject ? 'Las medias no son todas iguales' : 'No hay pruebas de que las medias difieran'}
        </p>
        <p className="mt-1 text-[15px] leading-relaxed opacity-90">
          {reject
            ? 'Se rechaza H₀: al menos un grupo tiene una media distinta. Mira las comparaciones por pares para saber cuál.'
            : 'No se rechaza H₀: las diferencias observadas pueden deberse al azar del muestreo.'}
        </p>
      </div>
    </div>
  );
}

function TukeyCard({ tukey }: { tukey: TukeyResult }) {
  return (
    <Section
      title="Comparaciones por pares (Tukey HSD)"
      alwaysShowHeader
      description={`Dos grupos difieren si |Δ| supera el HSD. Valor q usado: ${formatNumber(tukey.q, 3)}.`}
    >
      {tukey.warning && (
        <p role="note" className="rounded-md bg-v0-100 px-4 py-3 text-[14px] text-v0-800 dark:bg-v0-800 dark:text-v0-100">
          {tukey.warning}
        </p>
      )}
      <div className="overflow-x-auto rounded-lg bg-v0-50 dark:bg-v0-900">
        <table className="w-full min-w-[480px] text-left text-[15px]">
          <thead>
            <tr className="border-b border-v0-150 text-[14px] text-v0-600 dark:border-v0-800 dark:text-v0-300">
              <th scope="col" className="px-4 py-3 font-medium">Pareja</th>
              <th scope="col" className="px-4 py-3 text-right font-medium">|Δ| medias</th>
              <th scope="col" className="px-4 py-3 text-right font-medium">HSD</th>
              <th scope="col" className="px-4 py-3 font-medium">Resultado</th>
            </tr>
          </thead>
          <tbody>
            {tukey.comparisons.map((c) => (
              <tr key={`${c.a}-${c.b}`} className="border-b border-v0-100 last:border-0 dark:border-v0-800">
                <td className="px-4 py-3 font-medium text-v0-900 dark:text-v0-50">{c.a} vs {c.b}</td>
                <td className="px-4 py-3 text-right tabular-nums text-v0-800 dark:text-v0-100">{formatNumber(c.meanDiff, 3)}</td>
                <td className="px-4 py-3 text-right tabular-nums text-v0-800 dark:text-v0-100">{formatNumber(c.hsd, 3)}</td>
                <td className="px-4 py-3">
                  <span className={`text-[14px] font-semibold ${c.significant ? 'text-v0-950 dark:text-v0-50' : 'text-v0-500 dark:text-v0-300'}`}>
                    {c.significant ? 'Diferencia significativa' : 'Sin diferencia clara'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

function EmptyState() {
  return (
    <EmptyResult
      title="Faltan datos para el análisis"
      text="Un factor: al menos 2 grupos con 2 datos cada uno. Dos factores: una rejilla completa de al menos 2×2."
    />
  );
}
