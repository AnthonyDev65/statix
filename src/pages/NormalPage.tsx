// =====================================================
// Statix — NormalPage
// =====================================================
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Sigma, TrendingUp, TrendingDown } from 'lucide-react';
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
import { DistributionChart } from '@/charts';
import { normalSchema, type NormalFormValues } from '@/utils/validators.utils';
import { calculateNormal } from '@/services/statistics.service';
import { NORMAL_FORMULAS } from '@/formulas/formulas';
import { useHistory } from '@/context/HistoryContext';
import { formatNumber, formatProbability, frequencyPhrase } from '@/utils/formatters.utils';
import type { NormalMode, NormalResults } from '@/types';

const DEFAULTS: NormalFormValues = { mu: 100, sigma: 15, x: 115, x2: 85, mode: 'between' };
const EXAMPLE: NormalFormValues = { mu: 0, sigma: 1, x: 1.96, x2: -1.96, mode: 'between' };

// "Acumulada" y "cola izquierda" calculan lo mismo, así que solo se ofrece una.
const MODES: Array<{ value: NormalMode; label: string; notation: string }> = [
  { value: 'left-tail', label: 'Menor que x', notation: 'P(X ≤ x)' },
  { value: 'right-tail', label: 'Mayor que x', notation: 'P(X ≥ x)' },
  { value: 'between', label: 'Entre a y b', notation: 'P(a ≤ X ≤ b)' },
];

const MODE_TEXT: Record<NormalMode, string> = {
  'between': 'entre a y b',
  'cumulative': 'menor que x',
  'left-tail': 'menor que x',
  'right-tail': 'mayor que x',
};

export function NormalPage() {
  const { add } = useHistory();
  const {
    handleSubmit, formState: { errors },
    setValue, watch, reset,
  } = useForm<NormalFormValues>({
    resolver: zodResolver(normalSchema),
    defaultValues: DEFAULTS,
    mode: 'onChange',
  });
  const [results, setResults] = useState<NormalResults | null>(null);
  const values = watch();

  const onSubmit = (data: NormalFormValues) => {
    const r = calculateNormal(data);
    setResults(r);
    add({
      type: 'normal',
      title: `Normal · μ=${data.mu}, σ=${data.sigma}, ${MODE_TEXT[data.mode]}`,
      summary: `P = ${formatNumber(r.probability, 4)} · Z = ${formatNumber(r.zScore, 3)}`,
      inputs: { mu: data.mu, sigma: data.sigma, x: data.x, mode: data.mode },
    });
  };

  const onExample = () => {
    setValue('mu', EXAMPLE.mu, { shouldValidate: true });
    setValue('sigma', EXAMPLE.sigma, { shouldValidate: true });
    setValue('x', EXAMPLE.x, { shouldValidate: true });
    setValue('x2', EXAMPLE.x2, { shouldValidate: true });
    setValue('mode', EXAMPLE.mode, { shouldValidate: true });
    onSubmit(EXAMPLE);
  };

  const onReset = () => { reset(DEFAULTS); setResults(null); };

  const liveResults = useMemo<NormalResults | null>(() => {
    const parsed = normalSchema.safeParse(values);
    if (!parsed.success) return null;
    return calculateNormal(parsed.data);
  }, [values]);

  const display = results ?? liveResults;

  const summary = display
    ? `Distribución Normal
μ = ${values.mu}, σ = ${values.sigma}
Cálculo: ${MODE_TEXT[values.mode]}
Z = ${formatNumber(display.zScore, 4)}
Probabilidad: ${formatNumber(display.probability, 6)} (${formatProbability(display.probability, 4)})`
    : '';

  const pdfPayload = {
    documentTitle: `Normal · μ=${values.mu} σ=${values.sigma}`,
    subtitle: `Cálculo: probabilidad ${MODE_TEXT[values.mode]}`,
    meta: [
      { label: 'μ', value: String(values.mu) },
      { label: 'σ', value: String(values.sigma) },
      { label: 'x', value: String(values.x) },
      ...(values.mode === 'between' ? [{ label: 'a', value: String(values.x2 ?? '—') }] : []),
      { label: 'cálculo', value: MODE_TEXT[values.mode] },
    ],
    sections: display
      ? [{ title: 'Resultado', content: [
          `Z = ${formatNumber(display.zScore, 4)}`,
          `P = ${formatNumber(display.probability, 6)} (${formatProbability(display.probability)})`,
          `f(x) = ${formatNumber(display.pdf, 6)}`,
        ]}]
      : [],
  };

  return (
    <div className="space-y-12">
      <PageHeader
        title="Distribución Normal"
        description="La curva de campana. Modela estaturas, notas, errores de medición y casi cualquier suma de muchos efectos pequeños."
        icon={Activity}
        badge="N(μ, σ²)"
        actions={display && <ExportButton payload={pdfPayload} summary={summary} label="Exportar" />}
      />

      <div className="grid gap-6 lg:grid-cols-[1.05fr_1.4fr]">
        <Section title="Datos del problema" alwaysShowHeader description="Elige qué probabilidad quieres y describe la campana con su media y su desviación.">
          <Panel>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <fieldset>
              <legend className="mb-2 text-[15px] font-medium text-v0-800 dark:text-v0-100">
                ¿Qué probabilidad buscas?
              </legend>
              <div role="radiogroup" className="grid grid-cols-1 gap-1.5 sm:grid-cols-3">
                {MODES.map((m) => {
                  const active = values.mode === m.value || (m.value === 'left-tail' && values.mode === 'cumulative');
                  return (
                    <button
                      key={m.value}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setValue('mode', m.value, { shouldValidate: true })}
                      className={`rounded-md px-3 py-2.5 text-left transition-colors duration-150 ${
                        active
                          ? 'bg-v0-950 text-v0-50 dark:bg-v0-50 dark:text-v0-950'
                          : 'bg-v0-100 text-v0-800 hover:bg-v0-150 dark:bg-v0-800 dark:text-v0-100 dark:hover:bg-v0-700'
                      }`}
                    >
                      <span className="block text-[15px] font-semibold">{m.label}</span>
                      <span className={`block text-[13px] ${active ? 'text-v0-300 dark:text-v0-300' : 'text-v0-600 dark:text-v0-300'}`}>
                        {m.notation}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="grid gap-5 sm:grid-cols-2">
              <NumberInput
                label="Media (μ)"
                tooltip="Centro de la campana." step={0.01}
                value={values.mu}
                onValueChange={(v) => setValue('mu', v, { shouldValidate: true, shouldDirty: true })}
                error={errors.mu?.message}
              />
              <NumberInput
                label="Desviación típica (σ)"
                tooltip="Qué tan ancha es la campana. Debe ser mayor que 0."
                min={0.0001} step={0.01}
                value={values.sigma}
                onValueChange={(v) => setValue('sigma', v, { shouldValidate: true, shouldDirty: true })}
                error={errors.sigma?.message}
              />
            </div>

            {values.mode === 'between' ? (
              <div className="grid gap-5 sm:grid-cols-2">
                <NumberInput
                  label="Desde (a)"
                  tooltip="Extremo inferior del intervalo." step={0.01}
                  value={values.x2 ?? 0}
                  onValueChange={(v) => setValue('x2', v, { shouldValidate: true, shouldDirty: true })}
                  error={errors.x2?.message}
                />
                <NumberInput
                  label="Hasta (b)"
                  tooltip="Extremo superior del intervalo." step={0.01}
                  value={values.x}
                  onValueChange={(v) => setValue('x', v, { shouldValidate: true, shouldDirty: true })}
                  error={errors.x?.message}
                />
              </div>
            ) : (
              <NumberInput
                label="Valor (x)"
                tooltip="El valor con el que comparas." step={0.01}
                value={values.x}
                onValueChange={(v) => setValue('x', v, { shouldValidate: true, shouldDirty: true })}
                error={errors.x?.message}
              />
            )}

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
                  label={
                    display.isBetween
                      ? `Entre ${formatNumber(display.bounds.a ?? 0, 3)} y ${formatNumber(display.bounds.b ?? 0, 3)}`
                      : values.mode === 'right-tail'
                      ? `Mayor que ${formatNumber(values.x, 3)}`
                      : `Menor que ${formatNumber(values.x, 3)}`
                  }
                  meta={`Z = ${formatNumber(display.zScore, 3)}`}
                  value={formatProbability(display.probability, 2)}
                  description={formatNumber(display.probability, 6)}
                  interpretation={`Un valor tomado al azar cae ahí ${frequencyPhrase(display.probability)}.`}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <StatCard label="Puntaje Z" value={formatNumber(display.zScore, 4)} icon={Sigma} description={`x está a ${formatNumber(Math.abs(display.zScore), 2)} desviaciones de la media`} />
                  <StatCard label="Densidad f(x)" value={formatNumber(display.pdf, 5)} icon={TrendingUp} description="Altura de la curva en x (no es una probabilidad)" />
                  <StatCard label="μ − σ" value={formatNumber(values.mu - values.sigma, 3)} icon={TrendingDown} description="Entre μ − σ y μ + σ cae el 68 % de los datos" />
                  <StatCard label="μ + σ" value={formatNumber(values.mu + values.sigma, 3)} icon={TrendingUp} description="Entre μ − 2σ y μ + 2σ, el 95 %" />
                </div>
              </motion.div>
            ) : (
              <EmptyResult />
            )}
          </AnimatePresence>
        </Section>
      </div>

      <Section title="Curva de densidad" alwaysShowHeader description="El área coloreada bajo la curva es la probabilidad calculada.">
        <ChartPanel caption="Se muestra la curva desde μ − 4,5σ hasta μ + 4,5σ.">
          {display ? (
            <DistributionChart data={display.distribution} shaded={display.shadedArea} mu={values.mu} sigma={values.sigma} height={340} />
          ) : (
            <div className="h-[340px]" />
          )}
        </ChartPanel>
      </Section>

      <AdvancedOnly>
        <Section title="Fórmulas" divider description="Definición y estandarización">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {NORMAL_FORMULAS.map((f, i) => (
              <FormulaCard key={f.id} formula={f} index={i} />
            ))}
          </div>
        </Section>

        <TheoryDocs moduleId="normal" />

        <HistoryPanel />
      </AdvancedOnly>
    </div>
  );
}
