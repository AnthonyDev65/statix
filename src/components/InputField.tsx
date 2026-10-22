// =====================================================
// Statix — InputField (Vercel-style)
// =====================================================
import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { TooltipInfo } from './TooltipInfo';

interface InputFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
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
            className="flex items-center gap-1.5 text-[15px] font-medium text-v0-800 dark:text-v0-100"
          >
            {label}
            {tooltip && <TooltipInfo content={tooltip} />}
          </label>
          {hint && (
            <span className="text-[13px] tabular-nums text-v0-600 dark:text-v0-300">
              {hint}
            </span>
          )}
        </div>
        <div
          className={`group relative flex items-stretch overflow-hidden rounded-md border bg-v0-50 transition-all duration-200 dark:bg-v0-900 ${
            error
              ? 'border-rose-500 focus-within:border-rose-500'
              : 'border-v0-150 hover:border-v0-300 focus-within:border-v0-950 dark:border-v0-800 dark:hover:border-v0-600 dark:focus-within:border-v0-50'
          } ${className}`}
        >
          {prefix && (
            <span className="flex items-center border-r border-v0-150 bg-v0-50 px-3 text-[13px] font-medium text-v0-600 dark:border-v0-800 dark:bg-v0-900 dark:text-v0-300">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            {...rest}
            aria-invalid={error ? true : undefined}
            className="h-11 w-full bg-transparent px-3.5 text-[16px] font-medium tabular-nums text-v0-950 placeholder:font-normal placeholder:text-v0-500 focus:outline-none dark:text-v0-50 dark:placeholder:text-v0-500"
          />
          {suffix && (
            <span className="flex items-center border-l border-v0-150 bg-v0-50 px-3 text-[13px] font-medium text-v0-600 dark:border-v0-800 dark:bg-v0-900 dark:text-v0-300">
              {suffix}
            </span>
          )}
        </div>
        {error && (
          <p role="alert" className="flex items-center gap-1.5 text-[14px] font-medium text-rose-700 dark:text-rose-400">
            <span className="inline-block h-1 w-1 rounded-full bg-rose-500" />
            {error}
          </p>
        )}
      </div>
    );
  },
);
