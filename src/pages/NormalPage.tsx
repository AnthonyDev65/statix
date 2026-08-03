// =====================================================
// Statix — NormalPage
// =====================================================
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Calculator, Sigma, TrendingUp, TrendingDown } from 'lucide-react';
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
import { DistributionChart } from '@/charts';
import { normalSchema, type NormalFormValues } from '@/utils/validators.utils';
import { calculateNormal } from '@/services/statistics.service';
import { NORMAL_FORMULAS } from '@/formulas/formulas';
import { useHistory } from '@/context/HistoryContext';
import { formatNumber, formatProbability } from '@/utils/formatters.utils';
import type { NormalMode, NormalResults } from '@/types';

const DEFAULTS: NormalFormValues = { mu: 100, sigma: 15, x: 115, x2: 85, mode: 'between' };
const EXAMPLE: NormalFormValues = { mu: 0, sigma: 1, x: 1.96, x2: -1.96, mode: 'between' };

const MODES: Array<{ value: NormalMode; label: string; notation: string; hint: string }> = [
  { value: 'between', label: 'Entre dos valores', notation: 'P(a ≤ X ≤ b)', hint: 'Área entre a y b' },
  { value: 'cumulative', label: 'Acumulada', notation: 'P(X ≤ x)', hint: 'Menor o igual a x' },
  { value: 'left-tail', label: 'Cola izquierda', notation: 'P(X ≤ x)', hint: 'Hasta x' },
  { value: 'right-tail', label: 'Cola derecha', notation: 'P(X ≥ x)', hint: 'Mayor o igual a x' },
];

export function NormalPage() {
  const { add } = useHistory();
  const {
    register, handleSubmit, formState: { errors },
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
      title: `Normal · μ=${data.mu}, σ=${data.sigma}, ${data.mode}`,
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
Modo: ${values.mode}
Z = ${formatNumber(display.zScore, 4)}
Probabilidad: ${formatNumber(display.probability, 6)} (${formatProbability(display.probability, 4)})`
    : '';

  const pdfPayload = {
    documentTitle: `Normal · μ=${values.mu} σ=${values.sigma}`,
    subtitle: `Cálculo: ${values.mode}`,
    meta: [
      { label: 'μ', value: String(values.mu) },
      { label: 'σ', value: String(values.sigma) },
      { label: 'x', value: String(values.x) },
      ...(values.mode === 'between' ? [{ label: 'a', value: String(values.x2 ?? '—') }] : []),
      { label: 'modo', value: values.mode },
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
        description="La distribución continua más importante en estadística. Permite modelar variables naturales, errores de medición y test de hipótesis."
        icon={Activity}
        badge="N(μ, σ²) · continuous"
        status={{ label: 'Ready', tone: 'ready' }}
        actions={display && <ExportButton payload={pdfPayload} summary={summary} label="Export" />}
      />

      <div className="grid gap-6 lg:grid-cols-[1.05fr_1.4fr]">
        <Section title="Parameters" monospaceTitle description="Configura la distribución y el cálculo">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5 rounded-xl border border-v0-200/30 bg-v0-50 p-6 dark:border-v0-800/30 dark:bg-v0-900"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <NumberInput
                {...register('mu')} label="Media (μ)"
                tooltip="Centro de la distribución." step={0.01}
                value={values.mu}
                onValueChange={(v) => setValue('mu', v, { shouldValidate: true, shouldDirty: true })}
                error={errors.mu?.message}
              />
              <NumberInput
                {...register('sigma')} label="Desviación (σ)"
                tooltip="Dispersión de la distribución. > 0."
                min={0.0001} step={0.01}
                value={values.sigma}
                onValueChange={(v) => setValue('sigma', v, { shouldValidate: true, shouldDirty: true })}
                error={errors.sigma?.message}
              />
            </div>

            <NumberInput
              {...register('x')} label="Valor (x)"
              tooltip="Valor a evaluar en la distribución." step={0.01}
              value={values.x}
              onValueChange={(v) => setValue('x', v, { shouldValidate: true, shouldDirty: true })}
              error={errors.x?.message}
            />

            {values.mode === 'between' && (
              <NumberInput
                {...register('x2')} label="Valor (a)"
                tooltip="Extremo inferior (a) del intervalo." step={0.01}
                value={values.x2 ?? 0}
                onValueChange={(v) => setValue('x2', v, { shouldValidate: true, shouldDirty: true })}
                error={errors.x2?.message}
              />
            )}

            <div className="space-y-2.5">
              <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.06em] text-v0-500/70 dark:text-v0-300/80">
                Calculation mode
              </span>
              <div className="space-y-1.5">
                {MODES.map((m) => {
                  const active = values.mode === m.value;
                  return (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setValue('mode', m.value, { shouldValidate: true })}
                      className={`group flex w-full items-center gap-3 rounded-md border px-3 py-2.5 text-left transition-all duration-150 ${
                        active
                          ? 'border-v0-950 bg-v0-100 dark:border-v0-50 dark:bg-v0-800'
                          : 'border-v0-200/30 bg-v0-50 hover:border-v0-300/60 hover:bg-v0-50 dark:border-v0-800/30 dark:bg-v0-900 dark:hover:border-v0-700 dark:hover:bg-v0-800'
                      }`}
                    >
                      <span
                        className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                          active
                            ? 'border-v0-950 bg-v0-950 dark:border-v0-50 dark:bg-v0-50'
                            : 'border-v0-300/20 dark:border-v0-600 group-hover:border-v0-400'
                        }`}
                      >
                        {active && (
                          <span className="h-1.5 w-1.5 rounded-full bg-v0-50 dark:bg-v0-900" />
                        )}
                      </span>
                      <span className="flex-1">
                        <span className="block text-[13px] font-medium text-v0-900 dark:text-v0-100">{m.label}</span>
                        <span className="block font-mono text-[10.5px] text-v0-500/70 dark:text-v0-300/80">{m.notation}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-v0-150/30 pt-5 dark:border-v0-800/30">
              <ActionBar onExample={onExample} onReset={onReset} onSubmit={handleSubmit(onSubmit)} />
            </div>
          </form>
        </Section>

        <Section title="Output" monospaceTitle description="Puntaje Z, probabilidad y densidad">
          <AnimatePresence mode="wait">
            {display ? (
              <motion.div key="results" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <ResultCard
                  label="Probabilidad" value={formatProbability(display.probability, 4)}
                  description={formatNumber(display.probability, 6)}
                  icon={Calculator} meta={`Z = ${formatNumber(display.zScore, 4)}`}
                  interpretation={
                    display.isBetween
                      ? `Probabilidad entre ${formatNumber(display.bounds.a ?? 0, 3)} y ${formatNumber(display.bounds.b ?? 0, 3)}.`
                      : values.mode === 'right-tail'
                      ? `Probabilidad de valores mayores o iguales a ${formatNumber(values.x, 3)}.`
                      : `Probabilidad acumulada hasta ${formatNumber(values.x, 3)}.`
                  }
                />
                <div className="grid gap-3 sm:grid-cols-3">
                  <StatCard label="Z-score" value={formatNumber(display.zScore, 4)} icon={Sigma} description="Desviaciones desde μ" />
                  <StatCard label="f(x)" value={formatNumber(display.pdf, 5)} icon={TrendingUp} description="Densidad de probabilidad" />
                  <StatCard label="Media" value={formatNumber(values.mu, 3)} icon={Activity} description="Centro de la distribución" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <StatCard label="μ − σ" value={formatNumber(values.mu - values.sigma, 3)} icon={TrendingDown} description="Límite inferior al 68%" />
                  <StatCard label="μ + σ" value={formatNumber(values.mu + values.sigma, 3)} icon={TrendingUp} description="Límite superior al 68%" />
                </div>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center rounded-xl border border-dashed border-v0-300/20 bg-v0-50 px-6 py-16 text-center dark:border-v0-700/30 dark:bg-v0-900">
                <span className="flex h-11 w-11 items-center justify-center rounded-md border border-v0-200/30 bg-v0-50 dark:border-v0-800/30 dark:bg-v0-900">
                  <Activity size={16} strokeWidth={1.75} className="text-v0-500/70 dark:text-v0-300/80" />
                </span>
                <p className="mt-4 text-[14px] font-medium text-v0-900 dark:text-v0-100">Introduce parámetros válidos</p>
              </motion.div>
            )}
          </AnimatePresence>
        </Section>
      </div>

      <Section title="Density curve" description="El área sombreada representa la probabilidad calculada">
        <div className="overflow-hidden rounded-xl border border-v0-200/30 bg-v0-50 dark:border-v0-800/30 dark:bg-v0-900">
          <div className="flex items-center justify-between border-b border-v0-150/30 px-5 py-3 dark:border-v0-800/30">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-emerald-500/60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              <span className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-v0-500/70 dark:text-v0-300/80">density.chart</span>
            </div>
            <span className="font-mono text-[10.5px] text-v0-500/70">x ∈ [μ ± 4.5σ]</span>
          </div>
          <div className="p-3">
            {display ? (
              <DistributionChart data={display.distribution} shaded={display.shadedArea} mu={values.mu} sigma={values.sigma} height={340} />
            ) : (
              <div className="h-[340px]" />
            )}
          </div>
        </div>
      </Section>

      <Section title="Framework" monospaceTitle description="Definición y estandarización">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {NORMAL_FORMULAS.map((f, i) => (
            <FormulaCard key={f.id} formula={f} index={i} />
          ))}
        </div>
      </Section>

      <TheoryDocs moduleId="normal" />

      <HistoryPanel />
    </div>
  );
}
