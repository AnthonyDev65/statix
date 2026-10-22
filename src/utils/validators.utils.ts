// =====================================================
// Statix - Validadores
// =====================================================
import { z } from 'zod';

// -----------------------------------------------------
// Esquemas
// -----------------------------------------------------
export const binomialSchema = z.object({
  n: z.coerce
    .number({ invalid_type_error: 'Ingresa un número' })
    .int('Debe ser un entero')
    .min(1, 'Mínimo 1')
    .max(100000, 'Valor demasiado grande'),
  p: z.coerce
    .number({ invalid_type_error: 'Ingresa un número' })
    .min(0, 'No puede ser negativo')
    .max(1, 'No puede ser mayor a 1'),
  x: z.coerce
    .number({ invalid_type_error: 'Ingresa un número' })
    .int('Debe ser un entero')
    .min(0, 'No puede ser negativo'),
}).refine((d) => d.x <= d.n, {
  message: 'x no puede ser mayor que n',
  path: ['x'],
});

export const hypergeometricSchema = z.object({
  N: z.coerce.number().int().min(1, 'Mínimo 1'),
  K: z.coerce.number().int().min(0, 'No puede ser negativo'),
  n: z.coerce.number().int().min(1, 'Mínimo 1'),
  x: z.coerce.number().int().min(0, 'No puede ser negativo'),
}).refine((d) => d.K <= d.N, {
  message: 'K no puede ser mayor que N',
  path: ['K'],
}).refine((d) => d.n <= d.N, {
  message: 'n no puede ser mayor que N',
  path: ['n'],
}).refine((d) => d.x <= d.n, {
  message: 'x no puede ser mayor que n',
  path: ['x'],
}).refine((d) => d.x <= d.K, {
  message: 'x no puede ser mayor que K',
  path: ['x'],
});

export const normalSchema = z.object({
  mu: z.coerce.number().finite('Debe ser un número finito'),
  sigma: z.coerce.number().positive('Debe ser positivo'),
  x: z.coerce.number().finite('Debe ser un número finito'),
  x2: z.coerce.number().finite('Debe ser un número finito').optional(),
  mode: z.enum(['cumulative', 'left-tail', 'right-tail', 'between']),
});

export const meanEstimationSchema = z.object({
  n: z.coerce.number().int().min(2, 'Mínimo 2 observaciones'),
  xBar: z.coerce.number().finite(),
  s: z.coerce.number().positive('Debe ser positivo'),
  confidence: z.coerce.number().min(0.5).max(0.9999),
  // true: s es σ poblacional conocida (IC con z); por defecto se usa t con n−1 gl
  sigmaKnown: z.boolean().optional(),
});

export const proportionEstimationSchema = z.object({
  n: z.coerce.number().int().min(1, 'Mínimo 1'),
  pHat: z.coerce.number().min(0).max(1),
  confidence: z.coerce.number().min(0.5).max(0.9999),
}).refine((d) => d.n * d.pHat >= 5 && d.n * (1 - d.pHat) >= 5, {
  message: 'Se requiere np̂ ≥ 5 y n(1-p̂) ≥ 5',
  path: ['pHat'],
});

// -----------------------------------------------------
// Tipos inferidos
// -----------------------------------------------------
export type BinomialFormValues = z.infer<typeof binomialSchema>;
export type HypergeometricFormValues = z.infer<typeof hypergeometricSchema>;
export type NormalFormValues = z.infer<typeof normalSchema>;
export type MeanEstimationFormValues = z.infer<typeof meanEstimationSchema>;
export type ProportionEstimationFormValues = z.infer<typeof proportionEstimationSchema>;
