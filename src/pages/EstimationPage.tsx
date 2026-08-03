// =====================================================
// Statix — EstimationPage
// =====================================================
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, BarChart3, Percent, Sigma } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Section } from '@/components/Section';
import { NumberInput } from '@/components/NumberInput';
import { StatCard } from '@/components/StatCard';
import { FormulaCard } from '@/components/FormulaCard';
import { ActionBar } from '@/components/ActionBar';
import { ExportButton } from '@/components/ExportButton';
import { HistoryPanel } from '@/components/HistoryPanel';
import { TheoryDocs } from '@/components/TheoryDocs';
import { AdvancedOnly } from '@/components/AdvancedOnly';
import { ConfidenceIntervalCard } from '@/components/ConfidenceIntervalCard';
import { ConfidenceChart } from '@/charts';
import { CONFIDENCE_LEVELS } from '@/constants';
import {
  meanEstimationSchema, proportionEstimationSchema,
  type MeanEstimationFormValues, type ProportionEstimationFormValues,
} from '@/utils/validators.utils';
import {
  calculateMeanEstimationCentered, calculateProportionEstimation,
} from '@/services/statistics.service';
import { ESTIMATION_FORMULAS } from '@/formulas/formulas';
import { useHistory } from '@/context/HistoryContext';
import { formatNumber, formatProbability } from '@/utils/formatters.utils';

const MEAN_DEFAULTS: MeanEstimationFormValues = { n: 30, xBar: 24.5, s: 2.1, confidence: 0.95 };
const MEAN_EXAMPLE: MeanEstimationFormValues = { n: 36, xBar: 502, s: 12, confidence: 0.95 };
const PROP_DEFAULTS: ProportionEstimationFormValues = { n: 400, pHat: 0.62, confidence: 0.95 };
const PROP_EXAMPLE: ProportionEstimationFormValues = { n: 500, pHat: 0.48, confidence: 0.95 };

type ActiveSection = 'mean' | 'proportion';

export function EstimationPage() {
  const { add } = useHistory();
  const [activeSection, setActiveSection] = useState<ActiveSection>('mean');

  const meanForm = useForm<MeanEstimationFormValues>({
    resolver: zodResolver(meanEstimationSchema),
    defaultValues: MEAN_DEFAULTS,
    mode: 'onChange',
  });
  const meanValues = meanForm.watch();
  const meanErrors = meanForm.formState.errors;
  const [meanResult, setMeanResult] = useState<ReturnType<typeof calculateMeanEstimationCentered> | null>(null);

  const onMeanSubmit = (data: MeanEstimationFormValues) => {
    const r = calculateMeanEstimationCentered(data);
    setMeanResult(r);
    add({
      type: 'estimation',
      title: `IC Media · n=${data.n}, x̄=${data.xBar}`,
      summary: `IC = [${formatNumber(r.lowerBound, 3)}, ${formatNumber(r.upperBound, 3)}] · ${formatProbability(data.confidence, 2)}`,
      inputs: { n: data.n, xBar: data.xBar, s: data.s, confidence: data.confidence },
    });
  };

  const liveMean = useMemo(() => {
    const parsed = meanEstimationSchema.safeParse(meanValues);
    if (!parsed.success) return null;
    return calculateMeanEstimationCentered(parsed.data);
  }, [meanValues]);
  const meanDisplay = meanResult ?? liveMean;

  const propForm = useForm<ProportionEstimationFormValues>({
    resolver: zodResolver(proportionEstimationSchema),
    defaultValues: PROP_DEFAULTS,
    mode: 'onChange',
  });
  const propValues = propForm.watch();
  const propErrors = propForm.formState.errors;
  const [propResult, setPropResult] = useState<ReturnType<typeof calculateProportionEstimation> | null>(null);

  const onPropSubmit = (data: ProportionEstimationFormValues) => {
    const r = calculateProportionEstimation(data);
    setPropResult(r);
    add({
      type: 'estimation',
      title: `IC Proporción · n=${data.n}, p̂=${data.pHat}`,
      summary: `IC = [${formatNumber(r.lowerBound, 4)}, ${formatNumber(r.upperBound, 4)}] · ${formatProbability(data.confidence, 2)}`,
      inputs: { n: data.n, pHat: data.pHat, confidence: data.confidence },
    });
  };

  const liveProp = useMemo(() => {
    const parsed = proportionEstimationSchema.safeParse(propValues);
    if (!parsed.success) return null;
    return calculateProportionEstimation(parsed.data);
  }, [propValues]);
  const propDisplay = propResult ?? liveProp;

  const summary = meanDisplay
    ? `IC Media
n = ${meanValues.n}, x̄ = ${meanValues.xBar}, s = ${meanValues.s}
Confianza: ${formatProbability(meanValues.confidence, 2)}
SE = ${formatNumber(meanDisplay.standardError, 4)}
Margen = ±${formatNumber(meanDisplay.marginOfError, 4)}
IC = [${formatNumber(meanDisplay.lowerBound, 4)}, ${formatNumber(meanDisplay.upperBound, 4)}]`
    : propDisplay
    ? `IC Proporción
n = ${propValues.n}, p̂ = ${propValues.pHat}
Confianza: ${formatProbability(propValues.confidence, 2)}
SE = ${formatNumber(propDisplay.standardError, 4)}
Margen = ±${formatNumber(propDisplay.marginOfError, 4)}
IC = [${formatNumber(propDisplay.lowerBound, 4)}, ${formatNumber(propDisplay.upperBound, 4)}]`
    : '';

  const pdfPayload = {
    documentTitle: 'Estimación de Parámetros · Intervalo de Confianza',
    subtitle: activeSection === 'mean' ? 'Media poblacional (μ)' : 'Proporción poblacional (p)',
    meta: activeSection === 'mean'
      ? [
          { label: 'n', value: String(meanValues.n) },
          { label: 'x̄', value: String(meanValues.xBar) },
          { label: 's', value: String(meanValues.s) },
          { label: 'confianza', value: formatProbability(meanValues.confidence, 2) },
        ]
      : [
          { label: 'n', value: String(propValues.n) },
          { label: 'p̂', value: String(propValues.pHat) },
          { label: 'confianza', value: formatProbability(propValues.confidence, 2) },
        ],
    sections:
      activeSection === 'mean' && meanDisplay
        ? [{ title: 'Cálculo', content: [
            `Error estándar: ${formatNumber(meanDisplay.standardError, 4)}`,
            `z crítico: ${formatNumber(meanDisplay.zCritical, 4)}`,
            `Margen de error: ±${formatNumber(meanDisplay.marginOfError, 4)}`,
            `IC: [${formatNumber(meanDisplay.lowerBound, 4)}, ${formatNumber(meanDisplay.upperBound, 4)}]`,
          ]}]
        : activeSection === 'proportion' && propDisplay
        ? [{ title: 'Cálculo', content: [
            `Error estándar: ${formatNumber(propDisplay.standardError, 4)}`,
            `z crítico: ${formatNumber(propDisplay.zCritical, 4)}`,
            `Margen de error: ±${formatNumber(propDisplay.marginOfError, 4)}`,
            `IC: [${formatNumber(propDisplay.lowerBound, 4)}, ${formatNumber(propDisplay.upperBound, 4)}]`,
          ]}]
        : [],
  };

  return (
    <div className="space-y-12">
      <PageHeader
        title="Estimación de Parámetros"
        description="Construye intervalos de confianza para la media y la proporción poblacional a partir de estadísticos muestrales."
        icon={Target}
        badge="inference"
        status={{ label: 'Ready', tone: 'ready' }}
        actions={(meanDisplay || propDisplay) && <ExportButton payload={pdfPayload} summary={summary} label="Export" />}
      />

      {/* Tabs estilo Vercel */}
      <div className="inline-flex items-center gap-1 rounded-lg border border-v0-200/30 bg-v0-50 p-1 dark:border-v0-800/30 dark:bg-v0-900">
        <SectionTab active={activeSection === 'mean'} onClick={() => setActiveSection('mean')} label="Media poblacional" sub="μ" />
        <SectionTab active={activeSection === 'proportion'} onClick={() => setActiveSection('proportion')} label="Proporción poblacional" sub="p" />
      </div>

      <AnimatePresence mode="wait">
        {activeSection === 'mean' && (
          <motion.div
            key="mean"
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <div className="grid gap-6 lg:grid-cols-[1.05fr_1.4fr]">
              <Section title="Sample statistics" monospaceTitle description="Estadísticos de la muestra">
                <form
                  onSubmit={meanForm.handleSubmit(onMeanSubmit)}
                  className="space-y-5 rounded-xl border border-v0-200/30 bg-v0-50 p-6 dark:border-v0-800/30 dark:bg-v0-900"
                >
                  <NumberInput
                    label="Muestra (n)"
                    tooltip="Número de observaciones." min={2} step={1}
                    value={meanValues.n}
                    onValueChange={(v) => meanForm.setValue('n', v, { shouldValidate: true, shouldDirty: true })}
                    error={meanErrors.n?.message}
                  />
                  <NumberInput
                    label="Media (x̄)"
                    tooltip="Promedio observado en la muestra." step={0.01}
                    value={meanValues.xBar}
                    onValueChange={(v) => meanForm.setValue('xBar', v, { shouldValidate: true, shouldDirty: true })}
                    error={meanErrors.xBar?.message}
                  />
                  <NumberInput
                    label="Desviación (s)"
                    tooltip="Desviación estándar muestral." min={0.0001} step={0.01}
                    value={meanValues.s}
                    onValueChange={(v) => meanForm.setValue('s', v, { shouldValidate: true, shouldDirty: true })}
                    error={meanErrors.s?.message}
                  />
                  <ConfidenceSelector
                    value={meanValues.confidence}
                    onChange={(v) => meanForm.setValue('confidence', v, { shouldValidate: true })}
                  />
                  <div className="border-t border-v0-150/30 pt-5 dark:border-v0-800/30">
                    <ActionBar
                      onExample={() => { meanForm.reset(MEAN_EXAMPLE); onMeanSubmit(MEAN_EXAMPLE); }}
                      onReset={() => { meanForm.reset(MEAN_DEFAULTS); setMeanResult(null); }}
                      onSubmit={meanForm.handleSubmit(onMeanSubmit)}
                    />
                  </div>
                </form>
              </Section>

              <Section title="Confidence interval" monospaceTitle description="Resultado del cálculo">
                {meanDisplay ? (
                  <div className="space-y-4">
                    <ConfidenceIntervalCard
                      lower={meanDisplay.lowerBound} upper={meanDisplay.upperBound}
                      center={meanDisplay.center} confidence={meanValues.confidence}
                      interpretation={`Con ${formatProbability(meanValues.confidence, 2)} de confianza, el verdadero valor de μ se encuentra entre ${formatNumber(meanDisplay.lowerBound, 3)} y ${formatNumber(meanDisplay.upperBound, 3)}.`}
                    />
                    <div className="overflow-hidden rounded-xl border border-v0-200/30 bg-v0-50 px-5 py-6 dark:border-v0-800/30 dark:bg-v0-900">
                      <ConfidenceChart lower={meanDisplay.lowerBound} upper={meanDisplay.upperBound} center={meanDisplay.center} height={140} />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <StatCard label="SE" value={formatNumber(meanDisplay.standardError, 4)} icon={Sigma} description="s / √n" />
                      <StatCard label="ME" value={`±${formatNumber(meanDisplay.marginOfError, 4)}`} icon={BarChart3} description={`z = ${formatNumber(meanDisplay.zCritical, 4)}`} />
                      <StatCard label="Confianza" value={formatProbability(meanValues.confidence, 2)} icon={Percent} description="Nivel seleccionado" />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-v0-300/20 bg-v0-50 px-6 py-16 text-center dark:border-v0-700/30 dark:bg-v0-900">
                    <Target size={22} strokeWidth={1.5} className="text-v0-400/70" />
                    <p className="mt-4 text-[14px] font-medium text-v0-900 dark:text-v0-100">Introduce parámetros válidos</p>
                  </div>
                )}
              </Section>
            </div>
          </motion.div>
        )}

        {activeSection === 'proportion' && (
          <motion.div
            key="prop"
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <div className="grid gap-6 lg:grid-cols-[1.05fr_1.4fr]">
              <Section title="Sample statistics" monospaceTitle description="Para una variable Bernoulli">
                <form
                  onSubmit={propForm.handleSubmit(onPropSubmit)}
                  className="space-y-5 rounded-xl border border-v0-200/30 bg-v0-50 p-6 dark:border-v0-800/30 dark:bg-v0-900"
                >
                  <NumberInput
                    label="Muestra (n)"
                    tooltip="Número de ensayos Bernoulli observados." min={1} step={1}
                    value={propValues.n}
                    onValueChange={(v) => propForm.setValue('n', v, { shouldValidate: true, shouldDirty: true })}
                    error={propErrors.n?.message}
                  />
                  <NumberInput
                    label="Proporción (p̂)" hint="0 ≤ p̂ ≤ 1"
                    tooltip="Frecuencia relativa de éxito en la muestra." min={0} max={1} step={0.01}
                    value={propValues.pHat}
                    onValueChange={(v) => propForm.setValue('pHat', v, { shouldValidate: true, shouldDirty: true })}
                    error={propErrors.pHat?.message}
                  />
                  <ConfidenceSelector
                    value={propValues.confidence}
                    onChange={(v) => propForm.setValue('confidence', v, { shouldValidate: true })}
                  />
                  <div className="border-t border-v0-150/30 pt-5 dark:border-v0-800/30">
                    <ActionBar
                      onExample={() => { propForm.reset(PROP_EXAMPLE); onPropSubmit(PROP_EXAMPLE); }}
                      onReset={() => { propForm.reset(PROP_DEFAULTS); setPropResult(null); }}
                      onSubmit={propForm.handleSubmit(onPropSubmit)}
                    />
                  </div>
                </form>
              </Section>

              <Section title="Confidence interval" monospaceTitle description="Resultado del cálculo">
                {propDisplay ? (
                  <div className="space-y-4">
                    <ConfidenceIntervalCard
                      lower={propDisplay.lowerBound} upper={propDisplay.upperBound}
                      center={propDisplay.center} confidence={propValues.confidence}
                      interpretation={`Con ${formatProbability(propValues.confidence, 2)} de confianza, la verdadera proporción p se encuentra entre ${formatNumber(propDisplay.lowerBound, 4)} y ${formatNumber(propDisplay.upperBound, 4)}.`}
                    />
                    <div className="overflow-hidden rounded-xl border border-v0-200/30 bg-v0-50 px-5 py-6 dark:border-v0-800/30 dark:bg-v0-900">
                      <ConfidenceChart lower={propDisplay.lowerBound} upper={propDisplay.upperBound} center={propDisplay.center} height={140} />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <StatCard label="SE" value={formatNumber(propDisplay.standardError, 4)} icon={Sigma} description="√(p̂(1-p̂)/n)" />
                      <StatCard label="ME" value={`±${formatNumber(propDisplay.marginOfError, 4)}`} icon={BarChart3} description={`z = ${formatNumber(propDisplay.zCritical, 4)}`} />
                      <StatCard label="Confianza" value={formatProbability(propValues.confidence, 2)} icon={Percent} description="Nivel seleccionado" />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-v0-300/20 bg-v0-50 px-6 py-16 text-center dark:border-v0-700/30 dark:bg-v0-900">
                    <Target size={22} strokeWidth={1.5} className="text-v0-400/70" />
                    <p className="mt-4 text-[14px] font-medium text-v0-900 dark:text-v0-100">Introduce parámetros válidos</p>
                  </div>
                )}
              </Section>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AdvancedOnly>
        <Section title="Framework" monospaceTitle divider description="Fórmulas utilizadas">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {ESTIMATION_FORMULAS.map((f, i) => (
              <FormulaCard key={f.id} formula={f} index={i} />
            ))}
          </div>
        </Section>

        <TheoryDocs moduleId="estimation" />

        <HistoryPanel />
      </AdvancedOnly>
    </div>
  );
}

function SectionTab({
  active, onClick, label, sub,
}: {
  active: boolean; onClick: () => void; label: string; sub: string;
}) {
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

function ConfidenceSelector({
  value, onChange,
}: {
  value: number; onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2.5">
      <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.06em] text-v0-500/70 dark:text-v0-300/80">
        Confidence level
      </span>
      <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
        {CONFIDENCE_LEVELS.map((c) => {
          const active = Math.abs(c.value - value) < 1e-6;
          return (
            <button
              key={c.value}
              type="button"
              onClick={() => onChange(c.value)}
              className={`rounded-md border px-2 py-2 font-mono text-[12px] font-medium transition-all duration-150 active:scale-[0.97] ${
                active
                  ? 'border-v0-950 bg-v0-950 text-v0-50 dark:border-v0-50 dark:bg-v0-50 dark:text-v0-950'
                  : 'border-v0-200/30 bg-v0-50 text-v0-700 hover:border-v0-300/60 hover:bg-v0-50 dark:border-v0-800/30 dark:bg-v0-900 dark:text-v0-300 dark:hover:border-v0-700 dark:hover:bg-v0-900'
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
