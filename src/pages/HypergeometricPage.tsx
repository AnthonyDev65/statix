// =====================================================
// Statix — HypergeometricPage
// =====================================================
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Percent, Activity } from 'lucide-react';
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
import {
  hypergeometricSchema, type HypergeometricFormValues,
} from '@/utils/validators.utils';
import { calculateHypergeometric } from '@/services/statistics.service';
import { HYPERGEOMETRIC_FORMULAS } from '@/formulas/formulas';
import { useHistory } from '@/context/HistoryContext';
import { formatNumber, formatProbability, frequencyPhrase } from '@/utils/formatters.utils';
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
        badge="H(N, K, n)"
        actions={display && <ExportButton payload={pdfPayload} summary={summary} label="Exportar" />}
      />

      <div className="grid gap-6 lg:grid-cols-[1.05fr_1.4fr]">
        <Section title="Datos del problema" alwaysShowHeader description="Sacas n elementos de un grupo de N sin devolverlos; K de ellos cuentan como éxito.">
          <Panel>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <NumberInput
              label="Población (N)" hint="entero ≥ 1"
              tooltip="Número total de elementos en la población."
              min={1} step={1}
              value={values.N}
              onValueChange={(v) => setValue('N', v, { shouldValidate: true, shouldDirty: true })}
              error={errors.N?.message}
            />
            <NumberInput
              label="Éxitos en la población (K)" hint="0 ≤ K ≤ N"
              tooltip="Cantidad de elementos considerados éxito."
              min={0} step={1}
              value={values.K}
              onValueChange={(v) => setValue('K', v, { shouldValidate: true, shouldDirty: true })}
              error={errors.K?.message}
            />
            <NumberInput
              label="Tamaño de la muestra (n)" hint="1 ≤ n ≤ N"
              tooltip="Número de elementos extraídos sin reemplazo."
              min={1} step={1}
              value={values.n}
              onValueChange={(v) => setValue('n', v, { shouldValidate: true, shouldDirty: true })}
              error={errors.n?.message}
            />
            <NumberInput
              label="Éxitos en la muestra (x)" hint="0 ≤ x ≤ n, K"
              tooltip="Número de éxitos a evaluar en la muestra."
              min={0} step={1}
              value={values.x}
              onValueChange={(v) => setValue('x', v, { shouldValidate: true, shouldDirty: true })}
              error={errors.x?.message}
            />
            <div className="pt-2">
              <ActionBar onExample={onExample} onReset={onReset} onSubmit={handleSubmit(onSubmit)} />
            </div>
          </form>
          </Panel>
        </Section>

        <Section title="Resultados" alwaysShowHeader description="Se actualizan mientras escribes.">
          <AnimatePresence mode="wait">
            {display ? (
              <motion.div key="results" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <ResultCard
                  emphasis
                  label={`Exactamente ${values.x} éxitos en la muestra`}
                  meta={`P(X = ${values.x})`}
                  value={formatNumber(display.probabilityExact, 4)}
                  description={formatProbability(display.probabilityExact, 2)}
                  interpretation={`Si repites la extracción muchas veces, pasará ${frequencyPhrase(display.probabilityExact)}.`}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <ResultCard
                    label={`Como mucho ${values.x}`} meta={`P(X ≤ ${values.x})`}
                    value={formatNumber(display.probabilityLessEqual, 4)}
                    description={formatProbability(display.probabilityLessEqual, 2)}
                    interpretation={`${values.x} éxitos o menos en la muestra.`}
                  />
                  <ResultCard
                    label={`Al menos ${values.x}`} meta={`P(X ≥ ${values.x})`}
                    value={formatNumber(display.probabilityGreaterEqual, 4)}
                    description={formatProbability(display.probabilityGreaterEqual, 2)}
                    interpretation={`${values.x} éxitos o más en la muestra.`}
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <StatCard label="Media" value={formatNumber(display.mean, 4)} icon={Layers} description="E[X] = n·K/N" />
                  <StatCard label="Varianza" value={formatNumber(display.variance, 4)} icon={Percent} description="Con corrección por población finita" />
                  <StatCard label="Desviación" value={formatNumber(display.stdDev, 4)} icon={Activity} description="σ = √Var(X)" />
                </div>
              </motion.div>
            ) : (
              <EmptyResult />
            )}
          </AnimatePresence>
        </Section>
      </div>

      <Section title="Distribución de probabilidad" alwaysShowHeader description="Cada barra es la probabilidad de obtener ese número de éxitos en la muestra.">
        <ChartPanel caption={`La barra resaltada es x = ${values.x}. Se muestran los valores de 0 a ${Math.min(values.n, values.K)}.`}>
          {display ? (
            <ProbabilityChart data={display.distribution} highlightX={values.x} height={320} />
          ) : (
            <div className="h-[320px]" />
          )}
        </ChartPanel>
      </Section>

      <AdvancedOnly>
        <Section title="Fórmulas" divider description="Definición formal">
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
