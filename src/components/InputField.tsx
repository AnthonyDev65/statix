// =====================================================
// Statix — InputField (Vercel-style)
// =====================================================
import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { TooltipInfo } from './TooltipInfo';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  tooltip?: string;
  error?: string;
  suffix?: ReactNode;
  prefix?: ReactNode;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  function InputField(
    { label, hint, tooltip, error, suffix, prefix, className = '', id, ...rest },
    ref,
  ) {
    const inputId = id ?? `field-${label.replace(/\s+/g, '-').toLowerCase()}`;
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor={inputId}
            className="flex items-center gap-1.5 font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em] text-v0-600 dark:text-v0-300"
          >
            {label}
            {tooltip && <TooltipInfo content={tooltip} />}
          </label>
          {hint && (
            <span className="font-mono text-[10.5px] text-v0-400/70 dark:text-v0-500/70">
              {hint}
            </span>
          )}
        </div>
        <div
          className={`group relative flex items-stretch overflow-hidden rounded-md border bg-v0-50 transition-all duration-200 dark:bg-v0-900 ${
            error
              ? 'border-rose-500 focus-within:border-rose-500'
              : 'border-v0-200/30 hover:border-v0-300/60 focus-within:border-v0-950 dark:border-v0-700/30 dark:hover:border-v0-600 dark:focus-within:border-v0-50'
          } ${className}`}
        >
          {prefix && (
            <span className="flex items-center border-r border-v0-150/30 bg-v0-50 px-3 font-mono text-[11px] font-medium text-v0-600 dark:border-v0-800/30 dark:bg-v0-900 dark:text-v0-300">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            {...rest}
            className="h-11 w-full bg-transparent px-3.5 font-mono text-[14px] font-medium text-v0-950 placeholder:font-normal placeholder:text-v0-400/70 focus:outline-none dark:text-v0-50 dark:placeholder:text-v0-500/70"
          />
          {suffix && (
            <span className="flex items-center border-l border-v0-150/30 bg-v0-50 px-3 font-mono text-[11px] font-medium text-v0-600 dark:border-v0-800/30 dark:bg-v0-900 dark:text-v0-300">
              {suffix}
            </span>
          )}
        </div>
        {error && (
          <p className="flex items-center gap-1.5 font-mono text-[11px] font-medium text-rose-600 dark:text-rose-400">
            <span className="inline-block h-1 w-1 rounded-full bg-rose-500" />
            {error}
          </p>
        )}
      </div>
    );
  },
);
