// =====================================================
// Statix — BinomialPage
// =====================================================
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Sigma, Activity, Percent } from 'lucide-react';
import { Panel, EmptyResult, ChartPanel } from '@/components/Panel';
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
import { binomialSchema, type BinomialFormValues } from '@/utils/validators.utils';
import { calculateBinomial } from '@/services/statistics.service';
import { BINOMIAL_FORMULAS } from '@/formulas/formulas';
import { useHistory } from '@/context/HistoryContext';
import { formatNumber, formatProbability, frequencyPhrase } from '@/utils/formatters.utils';
import type { BinomialResults } from '@/types';

const DEFAULTS: BinomialFormValues = { n: 10, p: 0.5, x: 4 };
const EXAMPLE: BinomialFormValues = { n: 20, p: 0.3, x: 6 };

/** Lee n, p y x de la URL (p. ej. desde el tablero de Galton de la portada). */
function defaultsFromParams(params: URLSearchParams): BinomialFormValues {
  if (!params.has('n')) return DEFAULTS;
  const parsed = binomialSchema.safeParse({
    n: Number(params.get('n')),
    p: Number(params.get('p') ?? DEFAULTS.p),
    x: Number(params.get('x') ?? 0),
  });
  return parsed.success ? parsed.data : DEFAULTS;
}

export function BinomialPage() {
  const { add } = useHistory();
  const [params] = useSearchParams();
  const [initial] = useState(() => defaultsFromParams(params));
  const {
    handleSubmit, formState: { errors },
    setValue, watch, reset,
  } = useForm<BinomialFormValues>({
    resolver: zodResolver(binomialSchema),
    defaultValues: initial,
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
        badge="B(n, p)"
        actions={display && <ExportButton payload={pdfPayload} summary={summary} label="Exportar" />}
      />

      <div className="grid gap-6 lg:grid-cols-[1.05fr_1.4fr]">
        <Section title="Datos del problema" alwaysShowHeader description="Repites un mismo intento n veces; cada vez sale bien con probabilidad p.">
          <Panel>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <NumberInput
              label="Ensayos (n)" hint="entero ≥ 1"
              tooltip="Cantidad total de ensayos Bernoulli independientes."
              min={1} max={100000} step={1}
              error={errors.n?.message}
              value={values.n}
              onValueChange={(v) => setValue('n', v, { shouldValidate: true, shouldDirty: true })}
            />
            <NumberInput
              label="Probabilidad (p)" hint="0 ≤ p ≤ 1"
              tooltip="Probabilidad constante de éxito en cada ensayo."
              min={0} max={1} step={0.01}
              error={errors.p?.message}
              value={values.p}
              onValueChange={(v) => setValue('p', v, { shouldValidate: true, shouldDirty: true })}
            />
            <NumberInput
              label="Éxitos (x)" hint="0 ≤ x ≤ n"
              tooltip="Valor específico de éxitos a evaluar."
              min={0} max={values.n} step={1}
              error={errors.x?.message}
              value={values.x}
              onValueChange={(v) => setValue('x', v, { shouldValidate: true, shouldDirty: true })}
            />
            <div className="pt-2">
              <ActionBar
                onExample={onExample} onReset={onReset}
                onSubmit={handleSubmit(onSubmit)}
              />
            </div>
          </form>
          </Panel>
        </Section>

        <Section title="Resultados" alwaysShowHeader description="Se actualizan mientras escribes.">
          <AnimatePresence mode="wait">
            {display ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <ResultCard
                  emphasis
                  label={`Exactamente ${values.x} éxitos`}
                  meta={`P(X = ${values.x})`}
                  value={formatNumber(display.probabilityExact, 4)}
                  description={formatProbability(display.probabilityExact, 2)}
                  interpretation={`Si repites el experimento muchas veces, pasará ${frequencyPhrase(display.probabilityExact)}.`}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <ResultCard
                    label={`Como mucho ${values.x}`} meta={`P(X ≤ ${values.x})`}
                    value={formatNumber(display.probabilityLessEqual, 4)}
                    description={formatProbability(display.probabilityLessEqual, 2)}
                    interpretation={`${values.x} éxitos o menos.`}
                  />
                  <ResultCard
                    label={`Al menos ${values.x}`} meta={`P(X ≥ ${values.x})`}
                    value={formatNumber(display.probabilityGreaterEqual, 4)}
                    description={formatProbability(display.probabilityGreaterEqual, 2)}
                    interpretation={`${values.x} éxitos o más.`}
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <StatCard label="Media" value={formatNumber(display.mean, 4)} icon={Sigma} description="E[X] = n·p" />
                  <StatCard label="Varianza" value={formatNumber(display.variance, 4)} icon={Percent} description="Var(X) = n·p·(1-p)" />
                  <StatCard label="Desviación" value={formatNumber(display.stdDev, 4)} icon={Activity} description="σ = √(n·p·(1-p))" />
                </div>
              </motion.div>
            ) : (
              <EmptyResult />
            )}
          </AnimatePresence>
        </Section>
      </div>

      <Section title="Distribución de probabilidad" alwaysShowHeader description="Cada barra es la probabilidad de obtener ese número de éxitos.">
        <ChartPanel caption={`La barra resaltada es x = ${values.x}. Se muestran los valores de 0 a ${Math.min(values.n, 1000)}.`}>
          {display ? (
            <ProbabilityChart data={display.distribution} highlightX={values.x} height={320} />
          ) : (
            <div className="h-[320px]" />
          )}
        </ChartPanel>
      </Section>

      <AdvancedOnly>
        <Section title="Fórmulas" divider description="Definiciones y propiedades">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {BINOMIAL_FORMULAS.map((f, i) => (
              <FormulaCard key={f.id} formula={f} index={i} />
            ))}
          </div>
        </Section>

        <TheoryDocs moduleId="binomial" />

        <HistoryPanel />
      </AdvancedOnly>
    </div>
  );
}
