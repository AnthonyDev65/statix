// =====================================================
// Statix — NumberInput
// =====================================================
import {
  forwardRef,
  useCallback,
  useEffect,
  useState,
  type InputHTMLAttributes,
} from 'react';
import { Minus, Plus } from 'lucide-react';
import { InputField } from './InputField';

interface NumberInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label: string;
  hint?: string;
  tooltip?: string;
  error?: string;
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  prefix?: string;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  function NumberInput(
    {
      label, hint, tooltip, error, value, onValueChange,
      min, max, step = 1, suffix, prefix,
      ...rest
    },
    ref,
  ) {
    const clamp = useCallback(
      (v: number) => {
        if (Number.isNaN(v)) return 0;
        if (typeof min === 'number' && v < min) return min;
        if (typeof max === 'number' && v > max) return max;
        return v;
      },
      [min, max],
    );

    // Buffer de texto local: permite estados intermedios mientras se escribe
    // ("", "-", "0.", "1.") sin que el valor numérico controlado los borre.
    const [text, setText] = useState<string>(
      Number.isFinite(value) ? String(value) : '',
    );

    // Sincroniza el buffer cuando el valor externo cambia (reset, ejemplo,
    // botones +/-) pero sin sobrescribir lo que el usuario está tecleando.
    useEffect(() => {
      const parsed = text === '' ? NaN : Number(text);
      if (parsed !== value) {
        setText(Number.isFinite(value) ? String(value) : '');
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const handleStep = (delta: number) => {
      const base = Number.isFinite(value) ? value : 0;
      // Redondea a la precisión del paso para evitar artefactos de coma
      // flotante (p. ej. 0.05 + 0.01 = 0.06000000000000005).
      const decimals = (String(step).split('.')[1] ?? '').length;
      const next = clamp(Number((base + delta * step).toFixed(decimals)));
      setText(String(next));
      onValueChange(next);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      // Permitimos solo caracteres de un número decimal (con signo opcional).
      // Si el texto no encaja, ignoramos la pulsación y conservamos el buffer.
      if (raw !== '' && !/^-?\d*\.?\d*$/.test(raw)) return;
      setText(raw);
      // Solo propagamos cuando hay un número válido; los estados intermedios
      // ("", "-", "0.") se conservan en el buffer sin notificar al formulario.
      if (raw === '' || raw === '-' || raw === '.' || raw === '-.') return;
      const parsed = Number(raw);
      if (Number.isFinite(parsed)) onValueChange(parsed);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const parsed = text === '' ? NaN : Number(text);
      const normalized = clamp(parsed);
      setText(String(normalized));
      if (normalized !== value) onValueChange(normalized);
      rest.onBlur?.(e);
    };

    return (
      <InputField
        ref={ref}
        label={label}
        hint={hint}
        tooltip={tooltip}
        error={error}
        suffix={
          suffix ? (
            suffix
          ) : (
            <div className="flex h-full items-center gap-0.5">
              <button
                type="button"
                onClick={() => handleStep(-1)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-sm text-v0-500 transition-all duration-150 hover:bg-v0-200 hover:text-v0-900 active:scale-90 dark:text-v0-300 dark:hover:bg-v0-700 dark:hover:text-v0-100"
                aria-label="Decrementar"
                tabIndex={-1}
              >
                <Minus size={12} strokeWidth={2.2} />
              </button>
              <button
                type="button"
                onClick={() => handleStep(1)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-sm text-v0-500 transition-all duration-150 hover:bg-v0-200 hover:text-v0-900 active:scale-90 dark:text-v0-300 dark:hover:bg-v0-700 dark:hover:text-v0-100"
                aria-label="Incrementar"
                tabIndex={-1}
              >
                <Plus size={12} strokeWidth={2.2} />
              </button>
            </div>
          )
        }
        prefix={prefix}
        type="text"
        inputMode="decimal"
        {...rest}
        value={text}
        onChange={handleChange}
        onBlur={handleBlur}
      />
    );
  },
);
