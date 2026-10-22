// =====================================================
// Statix — EstimationPage
// =====================================================
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, BarChart3, Percent, Sigma } from 'lucide-react';
import { Panel, EmptyResult, ChartPanel } from '@/components/Panel';
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
            `Valor crítico: ${criticalLabel(meanDisplay)}${meanDisplay.df ? ` (gl = ${meanDisplay.df})` : ''}`,
            `Margen de error: ±${formatNumber(meanDisplay.marginOfError, 4)}`,
            `IC: [${formatNumber(meanDisplay.lowerBound, 4)}, ${formatNumber(meanDisplay.upperBound, 4)}]`,
          ]}]
        : activeSection === 'proportion' && propDisplay
        ? [{ title: 'Cálculo', content: [
            `Error estándar: ${formatNumber(propDisplay.standardError, 4)}`,
            `z crítico: ${formatNumber(propDisplay.zCritical, 4)}`,
            `IC de Wilson: [${formatNumber(propDisplay.wilsonLower, 4)}, ${formatNumber(propDisplay.wilsonUpper, 4)}]`,
            `Margen de error: ±${formatNumber(propDisplay.marginOfError, 4)}`,
            `IC: [${formatNumber(propDisplay.lowerBound, 4)}, ${formatNumber(propDisplay.upperBound, 4)}]`,
          ]}]
        : [],
  };

  return (
    <div className="space-y-12">
      <PageHeader
        title="Estimación de Parámetros"
        description="Con los datos de una muestra, calcula entre qué valores está casi seguro el valor real de toda la población."
        icon={Target}
        actions={(meanDisplay || propDisplay) && <ExportButton payload={pdfPayload} summary={summary} label="Exportar" />}
      />

      <div role="tablist" aria-label="Qué quieres estimar" className="inline-flex items-center gap-1 rounded-lg bg-v0-100 p-1 dark:bg-v0-900">
        <SectionTab active={activeSection === 'mean'} onClick={() => setActiveSection('mean')} label="Una media" sub="μ" />
        <SectionTab active={activeSection === 'proportion'} onClick={() => setActiveSection('proportion')} label="Una proporción" sub="p" />
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
              <Section title="Datos de la muestra" alwaysShowHeader description="Con el tamaño, la media y la desviación de tu muestra estimamos la media de toda la población.">
                <Panel>
                <form onSubmit={meanForm.handleSubmit(onMeanSubmit)} className="space-y-5">
                  <NumberInput
                    label="Tamaño de la muestra (n)"
                    tooltip="Número de observaciones." min={2} step={1}
                    value={meanValues.n}
                    onValueChange={(v) => meanForm.setValue('n', v, { shouldValidate: true, shouldDirty: true })}
                    error={meanErrors.n?.message}
                  />
                  <NumberInput
                    label="Media de la muestra (x̄)"
                    tooltip="Promedio observado en la muestra." step={0.01}
                    value={meanValues.xBar}
                    onValueChange={(v) => meanForm.setValue('xBar', v, { shouldValidate: true, shouldDirty: true })}
                    error={meanErrors.xBar?.message}
                  />
                  <NumberInput
                    label={meanValues.sigmaKnown ? 'Desviación de la población (σ)' : 'Desviación de la muestra (s)'}
                    tooltip={meanValues.sigmaKnown ? 'Desviación típica poblacional conocida.' : 'Desviación típica calculada con tus datos.'}
                    min={0.0001} step={0.01}
                    value={meanValues.s}
                    onValueChange={(v) => meanForm.setValue('s', v, { shouldValidate: true, shouldDirty: true })}
                    error={meanErrors.s?.message}
                  />
                  <label className="flex min-h-[44px] cursor-pointer items-start gap-3 rounded-md bg-v0-100 px-3 py-2.5 dark:bg-v0-800">
                    <input
                      type="checkbox"
                      checked={meanValues.sigmaKnown ?? false}
                      onChange={(e) => meanForm.setValue('sigmaKnown', e.target.checked, { shouldValidate: true })}
                      className="mt-1 h-4 w-4 accent-v0-950 dark:accent-v0-50"
                    />
                    <span>
                      <span className="block text-[15px] font-medium text-v0-900 dark:text-v0-50">Conozco la desviación de la población (σ)</span>
                      <span className="block text-[14px] text-v0-600 dark:text-v0-300">
                        Casi nunca pasa. Si no la conoces, se usa la t de Student, que es lo correcto con s.
                      </span>
                    </span>
                  </label>
                  <ConfidenceSelector
                    value={meanValues.confidence}
                    onChange={(v) => meanForm.setValue('confidence', v, { shouldValidate: true })}
                  />
                  <div className="pt-2">
                    <ActionBar
                      onExample={() => { meanForm.reset(MEAN_EXAMPLE); onMeanSubmit(MEAN_EXAMPLE); }}
                      onReset={() => { meanForm.reset(MEAN_DEFAULTS); setMeanResult(null); }}
                      onSubmit={meanForm.handleSubmit(onMeanSubmit)}
                    />
                  </div>
                </form>
                </Panel>
              </Section>

              <Section title="Intervalo de confianza" alwaysShowHeader description="Se actualiza mientras escribes.">
                {meanDisplay ? (
                  <div className="space-y-3">
                    <ConfidenceIntervalCard
                      lower={meanDisplay.lowerBound} upper={meanDisplay.upperBound}
                      center={meanDisplay.center} confidence={meanValues.confidence}
                      interpretation={`Si repitieras el muestreo muchas veces, el ${formatProbability(meanValues.confidence, 0)} de los intervalos calculados así contendría la media real μ. Con esta muestra: entre ${formatNumber(meanDisplay.lowerBound, 3)} y ${formatNumber(meanDisplay.upperBound, 3)}.`}
                    />
                    <ChartPanel>
                      <ConfidenceChart lower={meanDisplay.lowerBound} upper={meanDisplay.upperBound} center={meanDisplay.center} height={140} />
                    </ChartPanel>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <StatCard label="Error estándar" value={formatNumber(meanDisplay.standardError, 4)} icon={Sigma} description={meanValues.sigmaKnown ? 'σ / √n' : 's / √n'} />
                      <StatCard label="Margen de error" value={`±${formatNumber(meanDisplay.marginOfError, 4)}`} icon={BarChart3} description={`${criticalLabel(meanDisplay)} × error estándar`} />
                      <StatCard
                        label={meanDisplay.criticalKind === 't' ? 'Valor t crítico' : 'Valor z crítico'}
                        value={formatNumber(meanDisplay.critical, 4)}
                        icon={Percent}
                        description={meanDisplay.criticalKind === 't' ? `t de Student con ${meanDisplay.df} grados de libertad` : 'Normal estándar (σ conocida)'}
                      />
                    </div>
                  </div>
                ) : (
                  <EmptyResult />
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
              <Section title="Datos de la muestra" alwaysShowHeader description="Con el tamaño de la muestra y la proporción de éxitos observada estimamos la proporción real.">
                <Panel>
                <form onSubmit={propForm.handleSubmit(onPropSubmit)} className="space-y-5">
                  <NumberInput
                    label="Tamaño de la muestra (n)"
                    tooltip="Número de casos observados." min={1} step={1}
                    value={propValues.n}
                    onValueChange={(v) => propForm.setValue('n', v, { shouldValidate: true, shouldDirty: true })}
                    error={propErrors.n?.message}
                  />
                  <NumberInput
                    label="Proporción observada (p̂)" hint="entre 0 y 1"
                    tooltip="Éxitos divididos entre n. Por ejemplo, 248 de 400 es 0,62." min={0} max={1} step={0.01}
                    value={propValues.pHat}
                    onValueChange={(v) => propForm.setValue('pHat', v, { shouldValidate: true, shouldDirty: true })}
                    error={propErrors.pHat?.message}
                  />
                  <ConfidenceSelector
                    value={propValues.confidence}
                    onChange={(v) => propForm.setValue('confidence', v, { shouldValidate: true })}
                  />
                  <div className="pt-2">
                    <ActionBar
                      onExample={() => { propForm.reset(PROP_EXAMPLE); onPropSubmit(PROP_EXAMPLE); }}
                      onReset={() => { propForm.reset(PROP_DEFAULTS); setPropResult(null); }}
                      onSubmit={propForm.handleSubmit(onPropSubmit)}
                    />
                  </div>
                </form>
                </Panel>
              </Section>

              <Section title="Intervalo de confianza" alwaysShowHeader description="Se actualiza mientras escribes.">
                {propDisplay ? (
                  <div className="space-y-3">
                    <ConfidenceIntervalCard
                      lower={propDisplay.lowerBound} upper={propDisplay.upperBound}
                      center={propDisplay.center} confidence={propValues.confidence}
                      interpretation={`Con ${formatProbability(propValues.confidence, 0)} de confianza, la proporción real está entre ${formatProbability(propDisplay.lowerBound, 1)} y ${formatProbability(propDisplay.upperBound, 1)} (intervalo de Wald).`}
                    />
                    <ChartPanel>
                      <ConfidenceChart lower={propDisplay.lowerBound} upper={propDisplay.upperBound} center={propDisplay.center} height={140} />
                    </ChartPanel>
                    <div className="rounded-lg bg-v0-100 p-5 dark:bg-v0-800">
                      <p className="text-[15px] font-semibold tabular-nums text-v0-950 dark:text-v0-50">
                        Intervalo de Wilson: [{formatNumber(propDisplay.wilsonLower, 4)}, {formatNumber(propDisplay.wilsonUpper, 4)}]
                      </p>
                      <p className="mt-1.5 text-[14px] leading-relaxed text-v0-700 dark:text-v0-200">
                        Más fiable que el de Wald cuando n es pequeño o p̂ está cerca de 0 o de 1.
                        {propDisplay.waldClamped && ' Aquí el de Wald se salía de [0, 1] y se ha recortado: usa el de Wilson.'}
                      </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <StatCard label="Error estándar" value={formatNumber(propDisplay.standardError, 4)} icon={Sigma} description="√(p̂(1 − p̂) / n)" />
                      <StatCard label="Margen de error" value={`±${formatNumber(propDisplay.marginOfError, 4)}`} icon={BarChart3} description={`z = ${formatNumber(propDisplay.zCritical, 4)}`} />
                      <StatCard label="Confianza" value={formatProbability(propValues.confidence, 1)} icon={Percent} description="Nivel elegido" />
                    </div>
                  </div>
                ) : (
                  <EmptyResult />
                )}
              </Section>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AdvancedOnly>
        <Section title="Fórmulas" divider description="Fórmulas utilizadas">
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

function criticalLabel(r: { criticalKind: 'z' | 't'; critical: number }) {
  return `${r.criticalKind} = ${formatNumber(r.critical, 4)}`;
}

function SectionTab({
  active, onClick, label, sub,
}: {
  active: boolean; onClick: () => void; label: string; sub: string;
}) {
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
      <span className="text-[15px] opacity-80">{sub}</span>
    </button>
  );
}

function ConfidenceSelector({
  value, onChange,
}: {
  value: number; onChange: (v: number) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-[15px] font-medium text-v0-800 dark:text-v0-100">
        Nivel de confianza
      </legend>
      <div role="radiogroup" className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
        {CONFIDENCE_LEVELS.map((c) => {
          const active = Math.abs(c.value - value) < 1e-6;
          return (
            <button
              key={c.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(c.value)}
              className={`min-h-[40px] rounded-md px-2 text-[14px] font-medium tabular-nums transition-colors duration-150 active:scale-[0.97] ${
                active
                  ? 'bg-v0-950 text-v0-50 dark:bg-v0-50 dark:text-v0-950'
                  : 'bg-v0-100 text-v0-800 hover:bg-v0-150 dark:bg-v0-800 dark:text-v0-100 dark:hover:bg-v0-700'
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
