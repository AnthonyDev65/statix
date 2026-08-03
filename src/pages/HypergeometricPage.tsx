// =====================================================
// Statix — HypergeometricPage
// =====================================================
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Layers, Percent, TrendingUp, Activity } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Section } from '@/components/Section';
import { NumberInput } from '@/components/NumberInput';
import { StatCard } from '@/components/StatCard';
import { ResultCard } from '@/components/ResultCard';
import { FormulaCard } from '@/components/FormulaCard';
import { ActionBar } from '@/components/ActionBar';
import { ExportButton } from '@/components/ExportButton';
import { HistoryPanel } from '@/components/HistoryPanel';
import { TheoryDocs } from '@/components/TheoryDocs';
import { AdvancedOnly } from '@/components/AdvancedOnly';
import { ProbabilityChart } from '@/charts';
import {
  hypergeometricSchema, type HypergeometricFormValues,
} from '@/utils/validators.utils';
import { calculateHypergeometric } from '@/services/statistics.service';
import { HYPERGEOMETRIC_FORMULAS } from '@/formulas/formulas';
import { useHistory } from '@/context/HistoryContext';
import { formatNumber, formatProbability } from '@/utils/formatters.utils';
import type { HypergeometricResults } from '@/types';

const DEFAULTS: HypergeometricFormValues = { N: 50, K: 10, n: 8, x: 2 };
const EXAMPLE: HypergeometricFormValues = { N: 100, K: 30, n: 10, x: 3 };

export function HypergeometricPage() {
  const { add } = useHistory();
  const {
    handleSubmit, formState: { errors },
    setValue, watch, reset,
  } = useForm<HypergeometricFormValues>({
    resolver: zodResolver(hypergeometricSchema),
    defaultValues: DEFAULTS,
    mode: 'onChange',
  });
  const [results, setResults] = useState<HypergeometricResults | null>(null);
  const values = watch();

  const onSubmit = (data: HypergeometricFormValues) => {
    const r = calculateHypergeometric(data);
    setResults(r);
    add({
      type: 'hypergeometric',
      title: `Hipergeométrica · N=${data.N}, K=${data.K}, n=${data.n}, x=${data.x}`,
      summary: `P(X=${data.x}) = ${formatNumber(r.probabilityExact, 4)} · E[X] = ${formatNumber(r.mean, 2)}`,
      inputs: { N: data.N, K: data.K, n: data.n, x: data.x },
    });
  };

  const onExample = () => {
    setValue('N', EXAMPLE.N, { shouldValidate: true });
    setValue('K', EXAMPLE.K, { shouldValidate: true });
    setValue('n', EXAMPLE.n, { shouldValidate: true });
    setValue('x', EXAMPLE.x, { shouldValidate: true });
    onSubmit(EXAMPLE);
  };

  const onReset = () => { reset(DEFAULTS); setResults(null); };

  const liveResults = useMemo<HypergeometricResults | null>(() => {
    const parsed = hypergeometricSchema.safeParse(values);
    if (!parsed.success) return null;
    return calculateHypergeometric(parsed.data);
  }, [values]);

  const display = results ?? liveResults;

  const summary = display
    ? `Distribución Hipergeométrica
N=${values.N}, K=${values.K}, n=${values.n}
P(X = ${values.x}) = ${formatNumber(display.probabilityExact, 6)} (${formatProbability(display.probabilityExact, 4)})
P(X ≤ ${values.x}) = ${formatNumber(display.probabilityLessEqual, 6)}
P(X ≥ ${values.x}) = ${formatNumber(display.probabilityGreaterEqual, 6)}
Media: ${formatNumber(display.mean, 4)}
Varianza: ${formatNumber(display.variance, 4)}`
    : '';

  const pdfPayload = {
    documentTitle: `Hipergeométrica · N=${values.N} K=${values.K}`,
    subtitle: 'Muestreo sin reemplazo',
    meta: [
      { label: 'N', value: String(values.N) },
      { label: 'K', value: String(values.K) },
      { label: 'n', value: String(values.n) },
      { label: 'x', value: String(values.x) },
    ],
    sections: display
      ? [
          { title: 'Probabilidades', content: [
            `P(X = ${values.x}) = ${formatNumber(display.probabilityExact, 6)}`,
            `P(X <= ${values.x}) = ${formatNumber(display.probabilityLessEqual, 6)}`,
            `P(X >= ${values.x}) = ${formatNumber(display.probabilityGreaterEqual, 6)}`,
          ]},
          { title: 'Estadísticos', content: [
            `Media: ${formatNumber(display.mean, 4)}`,
            `Varianza: ${formatNumber(display.variance, 4)}`,
            `Desviación: ${formatNumber(display.stdDev, 4)}`,
          ]},
        ]
      : [],
  };

  return (
    <div className="space-y-12">
      <PageHeader
        title="Distribución Hipergeométrica"
        description="Modela el número de éxitos al extraer una muestra de tamaño n sin reemplazo de una población finita con N elementos y K éxitos."
        icon={Layers}
        badge="H(N, K, n) · discrete"
        status={{ label: 'Ready', tone: 'ready' }}
        actions={display && <ExportButton payload={pdfPayload} summary={summary} label="Export" />}
      />

      <div className="grid gap-6 lg:grid-cols-[1.05fr_1.4fr]">
        <Section title="Parameters" monospaceTitle description="Define la población y la muestra">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5 rounded-xl border border-v0-200/30 bg-v0-50 p-6 dark:border-v0-800/30 dark:bg-v0-900"
          >
            <NumberInput
              label="Población (N)" hint="int ≥ 1"
              tooltip="Número total de elementos en la población."
              min={1} step={1}
              value={values.N}
              onValueChange={(v) => setValue('N', v, { shouldValidate: true, shouldDirty: true })}
              error={errors.N?.message}
            />
            <NumberInput
              label="Éxitos pob. (K)" hint="0 ≤ K ≤ N"
              tooltip="Cantidad de elementos considerados éxito."
              min={0} step={1}
              value={values.K}
              onValueChange={(v) => setValue('K', v, { shouldValidate: true, shouldDirty: true })}
              error={errors.K?.message}
            />
            <NumberInput
              label="Muestra (n)" hint="1 ≤ n ≤ N"
              tooltip="Número de elementos extraídos sin reemplazo."
              min={1} step={1}
              value={values.n}
              onValueChange={(v) => setValue('n', v, { shouldValidate: true, shouldDirty: true })}
              error={errors.n?.message}
            />
            <NumberInput
              label="Éxitos obs. (x)" hint="0 ≤ x ≤ n, K"
              tooltip="Número de éxitos a evaluar en la muestra."
              min={0} step={1}
              value={values.x}
              onValueChange={(v) => setValue('x', v, { shouldValidate: true, shouldDirty: true })}
              error={errors.x?.message}
            />
            <div className="border-t border-v0-150/30 pt-5 dark:border-v0-800/30">
              <ActionBar onExample={onExample} onReset={onReset} onSubmit={handleSubmit(onSubmit)} />
            </div>
          </form>
        </Section>

        <Section title="Output" monospaceTitle description="Actualización instantánea">
          <AnimatePresence mode="wait">
            {display ? (
              <motion.div key="results" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <ResultCard
                    label="P(X = x)" value={formatNumber(display.probabilityExact, 4)}
                    description={formatProbability(display.probabilityExact, 4)}
                    icon={Calculator} meta={`x = ${values.x}`}
                    interpretation="Probabilidad exacta del número de éxitos en la muestra."
                  />
                  <ResultCard
                    label="P(X ≤ x)" value={formatNumber(display.probabilityLessEqual, 4)}
                    description={formatProbability(display.probabilityLessEqual, 4)}
                    icon={TrendingUp} meta="cumulative"
                    interpretation="Probabilidad acumulada."
                  />
                  <ResultCard
                    label="P(X ≥ x)" value={formatNumber(display.probabilityGreaterEqual, 4)}
                    description={formatProbability(display.probabilityGreaterEqual, 4)}
                    icon={Activity} meta="upper tail"
                    interpretation="Cola superior de la distribución."
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <StatCard label="Media" value={formatNumber(display.mean, 4)} icon={Layers} description="E[X] = n·K/N" />
                  <StatCard label="Varianza" value={formatNumber(display.variance, 4)} icon={Percent} description="Con corrección por población finita" />
                  <StatCard label="Desviación" value={formatNumber(display.stdDev, 4)} icon={Activity} description="σ = √Var(X)" />
                </div>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center rounded-xl border border-dashed border-v0-300/20 bg-v0-50 px-6 py-16 text-center dark:border-v0-700/30 dark:bg-v0-900">
                <span className="flex h-11 w-11 items-center justify-center rounded-md border border-v0-200/30 bg-v0-50 dark:border-v0-800/30 dark:bg-v0-900">
                  <Layers size={16} strokeWidth={1.75} className="text-v0-500/70 dark:text-v0-300/80" />
                </span>
                <p className="mt-4 text-[14px] font-medium text-v0-900 dark:text-v0-100">Introduce parámetros válidos</p>
                <p className="mt-1.5 max-w-xs font-mono text-[11.5px] text-v0-500/70 dark:text-v0-300/80">output will appear here once all params are valid</p>
              </motion.div>
            )}
          </AnimatePresence>
        </Section>
      </div>

      <Section title="Probability mass function" divider description="Visualización de P(X = x) para x = 0, 1, …, min(n, K)">
        <div className="overflow-hidden rounded-xl border border-v0-200/30 bg-v0-50 dark:border-v0-800/30 dark:bg-v0-900">
          <div className="flex items-center justify-between border-b border-v0-150/30 px-5 py-3 dark:border-v0-800/30">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-emerald-500/60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              <span className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-v0-500/70 dark:text-v0-300/80">pmf.chart</span>
            </div>
            <span className="font-mono text-[10.5px] text-v0-500/70 dark:text-v0-500/70">
              x ∈ [0, {Math.min(values.n, values.K)}]
            </span>
          </div>
          <div className="p-3">
            {display ? (
              <ProbabilityChart data={display.distribution} highlightX={values.x} height={320} />
            ) : (
              <div className="h-[320px]" />
            )}
          </div>
        </div>
      </Section>

      <AdvancedOnly>
        <Section title="Framework" monospaceTitle divider description="Definición formal">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {HYPERGEOMETRIC_FORMULAS.map((f, i) => (
              <FormulaCard key={f.id} formula={f} index={i} />
            ))}
          </div>
        </Section>

        <TheoryDocs moduleId="hypergeometric" />

        <HistoryPanel />
      </AdvancedOnly>
    </div>
  );
}
