// =====================================================
// Statix — BinomialPage
// =====================================================
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Sigma, TrendingUp, Activity, Percent } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Section } from '@/components/Section';
import { NumberInput } from '@/components/NumberInput';
import { StatCard } from '@/components/StatCard';
import { ResultCard } from '@/components/ResultCard';
import { FormulaCard } from '@/components/FormulaCard';
import { ActionBar } from '@/components/ActionBar';
import { ExportButton } from '@/components/ExportButton';
import { HistoryPanel } from '@/components/HistoryPanel';
import { ProbabilityChart } from '@/charts';
import { binomialSchema, type BinomialFormValues } from '@/utils/validators.utils';
import { calculateBinomial } from '@/services/statistics.service';
import { BINOMIAL_FORMULAS } from '@/formulas/formulas';
import { useHistory } from '@/context/HistoryContext';
import { formatNumber, formatProbability } from '@/utils/formatters.utils';
import type { BinomialResults } from '@/types';

const DEFAULTS: BinomialFormValues = { n: 10, p: 0.5, x: 4 };
const EXAMPLE: BinomialFormValues = { n: 20, p: 0.3, x: 6 };

export function BinomialPage() {
  const { add } = useHistory();
  const {
    register, handleSubmit, formState: { errors },
    setValue, watch, reset,
  } = useForm<BinomialFormValues>({
    resolver: zodResolver(binomialSchema),
    defaultValues: DEFAULTS,
    mode: 'onChange',
  });
  const [results, setResults] = useState<BinomialResults | null>(null);
  const values = watch();

  const onSubmit = (data: BinomialFormValues) => {
    const r = calculateBinomial(data);
    setResults(r);
    add({
      type: 'binomial',
      title: `Binomial · n=${data.n}, p=${data.p}, x=${data.x}`,
      summary: `P(X=${data.x}) = ${formatNumber(r.probabilityExact, 4)} · E[X] = ${formatNumber(r.mean, 2)}`,
      inputs: { n: data.n, p: data.p, x: data.x },
    });
  };

  const onExample = () => {
    setValue('n', EXAMPLE.n, { shouldValidate: true });
    setValue('p', EXAMPLE.p, { shouldValidate: true });
    setValue('x', EXAMPLE.x, { shouldValidate: true });
    onSubmit(EXAMPLE);
  };

  const onReset = () => {
    reset(DEFAULTS);
    setResults(null);
  };

  const liveResults = useMemo<BinomialResults | null>(() => {
    const parsed = binomialSchema.safeParse(values);
    if (!parsed.success) return null;
    return calculateBinomial(parsed.data);
  }, [values]);

  const display = results ?? liveResults;

  const summary = display
    ? `Distribución Binomial
Parámetros: n=${values.n}, p=${values.p}, x=${values.x}
P(X = ${values.x}) = ${formatNumber(display.probabilityExact, 6)} (${formatProbability(display.probabilityExact, 4)})
P(X ≤ ${values.x}) = ${formatNumber(display.probabilityLessEqual, 6)}
P(X ≥ ${values.x}) = ${formatNumber(display.probabilityGreaterEqual, 6)}
Media: ${formatNumber(display.mean, 4)}
Varianza: ${formatNumber(display.variance, 4)}
Desviación: ${formatNumber(display.stdDev, 4)}`
    : '';

  const pdfPayload = {
    documentTitle: `Binomial · n=${values.n} p=${values.p}`,
    subtitle: 'Informe generado por Statix',
    meta: [
      { label: 'n (ensayos)', value: String(values.n) },
      { label: 'p (probabilidad)', value: String(values.p) },
      { label: 'x (éxitos)', value: String(values.x) },
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
        title="Distribución Binomial"
        description="Modela el número de éxitos en n ensayos independientes con probabilidad de éxito constante p. Útil para control de calidad, ensayos clínicos y experimentos Bernoulli."
        icon={Sigma}
        badge="B(n, p) · discrete"
        status={{ label: 'Ready', tone: 'ready' }}
        actions={display && <ExportButton payload={pdfPayload} summary={summary} label="Export" />}
      />

      <div className="grid gap-6 lg:grid-cols-[1.05fr_1.4fr]">
        <Section title="Parameters" monospaceTitle description="Define los datos del experimento">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5 rounded-xl border border-v0-200/30 bg-v0-50 p-6 dark:border-v0-800/30 dark:bg-v0-900"
          >
            <NumberInput
              {...register('n')}
              label="Ensayos (n)" hint="int ≥ 1"
              tooltip="Cantidad total de ensayos Bernoulli independientes."
              min={1} max={100000} step={1}
              error={errors.n?.message}
              value={values.n}
              onValueChange={(v) => setValue('n', v, { shouldValidate: true, shouldDirty: true })}
            />
            <NumberInput
              {...register('p')}
              label="Probabilidad (p)" hint="0 ≤ p ≤ 1"
              tooltip="Probabilidad constante de éxito en cada ensayo."
              min={0} max={1} step={0.01}
              error={errors.p?.message}
              value={values.p}
              onValueChange={(v) => setValue('p', v, { shouldValidate: true, shouldDirty: true })}
            />
            <NumberInput
              {...register('x')}
              label="Éxitos (x)" hint="0 ≤ x ≤ n"
              tooltip="Valor específico de éxitos a evaluar."
              min={0} max={values.n} step={1}
              error={errors.x?.message}
              value={values.x}
              onValueChange={(v) => setValue('x', v, { shouldValidate: true, shouldDirty: true })}
            />
            <div className="border-t border-v0-150/30 pt-5 dark:border-v0-800/30">
              <ActionBar
                onExample={onExample} onReset={onReset}
                onSubmit={handleSubmit(onSubmit)}
              />
            </div>
          </form>
        </Section>

        <Section title="Output" monospaceTitle description="Métricas calculadas en tiempo real">
          <AnimatePresence mode="wait">
            {display ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="grid gap-3 sm:grid-cols-3">
                  <ResultCard
                    label="P(X = x)" value={formatNumber(display.probabilityExact, 4)}
                    description={formatProbability(display.probabilityExact, 4)}
                    icon={Calculator} meta={`x = ${values.x}`}
                    interpretation="Probabilidad exacta de obtener exactamente x éxitos."
                  />
                  <ResultCard
                    label="P(X ≤ x)" value={formatNumber(display.probabilityLessEqual, 4)}
                    description={formatProbability(display.probabilityLessEqual, 4)}
                    icon={TrendingUp} meta="cumulative"
                    interpretation="Probabilidad acumulada hasta x éxitos."
                  />
                  <ResultCard
                    label="P(X ≥ x)" value={formatNumber(display.probabilityGreaterEqual, 4)}
                    description={formatProbability(display.probabilityGreaterEqual, 4)}
                    icon={Activity} meta="upper tail"
                    interpretation="Probabilidad de obtener al menos x éxitos."
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <StatCard label="Media" value={formatNumber(display.mean, 4)} icon={Sigma} description="E[X] = n·p" />
                  <StatCard label="Varianza" value={formatNumber(display.variance, 4)} icon={Percent} description="Var(X) = n·p·(1-p)" />
                  <StatCard label="Desviación" value={formatNumber(display.stdDev, 4)} icon={Activity} description="σ = √(n·p·(1-p))" />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center rounded-xl border border-dashed border-v0-300/20 bg-v0-50 px-6 py-16 text-center dark:border-v0-700/30 dark:bg-v0-900"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-md border border-v0-200/30 bg-v0-50 dark:border-v0-800/30 dark:bg-v0-900">
                  <Calculator size={16} strokeWidth={1.75} className="text-v0-500/70 dark:text-v0-300/80" />
                </div>
                <p className="mt-4 text-[14px] font-medium text-v0-900 dark:text-v0-100">
                  Introduce parámetros válidos
                </p>
                <p className="mt-1.5 max-w-xs font-mono text-[11.5px] text-v0-500/70 dark:text-v0-300/80">
                  output will appear here once all params are valid
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </Section>
      </div>

      <Section title="Probability mass function" description="Distribución de probabilidad para los posibles valores de X">
        <div className="overflow-hidden rounded-xl border border-v0-200/30 bg-v0-50 dark:border-v0-800/30 dark:bg-v0-900">
          <div className="flex items-center justify-between border-b border-v0-150/30 px-5 py-3 dark:border-v0-800/30">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-emerald-500/60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              <span className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-v0-500/70 dark:text-v0-300/80">
                pmf.chart
              </span>
            </div>
            <span className="font-mono text-[10.5px] text-v0-500/70 dark:text-v0-500/70">
              x ∈ [0, {Math.min(values.n, 1000)}]
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

      <Section title="Framework" monospaceTitle description="Definiciones y propiedades">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {BINOMIAL_FORMULAS.map((f, i) => (
            <FormulaCard key={f.id} formula={f} index={i} />
          ))}
        </div>
      </Section>

      <HistoryPanel />
    </div>
  );
}
