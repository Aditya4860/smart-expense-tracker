import { memo } from 'react';

const SIZE_CLASSES = {
  sm:  'h-8 px-3 text-xs gap-1.5',
  md:  'h-9 px-4 text-sm gap-2',
  lg:  'h-11 px-6 text-sm gap-2',
  xl:  'h-12 px-8 text-base gap-2',
  icon:'h-9 w-9 p-0',
};

const VARIANT_CLASSES = {
  primary:   'bg-primary-500 text-white shadow-glow-primary hover:shadow-glow-primary hover:scale-[1.02] active:scale-[0.98]',
  secondary: 'border-[1.5px] border-surface-700 bg-surface-800 text-slate-300 hover:border-primary-500/50 hover:bg-surface-700 hover:text-white',
  ghost:     'text-slate-400 hover:bg-white/5 hover:text-white',
  danger:    'bg-danger-600 text-white hover:shadow-glow-danger hover:scale-[1.02] active:scale-[0.98]',
  success:   'bg-success-600 text-white hover:shadow-glow-success hover:scale-[1.02] active:scale-[0.98]',
};

/**
 * Button — design-system button with consistent variants, sizes and loading state.
 *
 * Props:
 *   variant    — 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'  (default: 'secondary')
 *   size       — 'sm' | 'md' | 'lg' | 'xl' | 'icon'                        (default: 'md')
 *   loading    — boolean  shows a spinner and disables the button
 *   fullWidth  — boolean  stretches to parent width
 *   children   — button content
 *   ...rest    — passed to the native <button>
 */
const Button = memo(function Button({
  variant   = 'secondary',
  size      = 'md',
  loading   = false,
  fullWidth = false,
  className = '',
  children,
  disabled,
  ...rest
}) {
  const base = [
    'inline-flex items-center justify-center rounded-[8px] font-medium',
    'transition-all duration-200',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-900',
    SIZE_CLASSES[size] ?? SIZE_CLASSES.md,
    VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.secondary,
    fullWidth ? 'w-full' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      className={base}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            className="h-4 w-4 animate-spin"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
          </svg>
          <span>Loading…</span>
        </>
      ) : children}
    </button>
  );
});

export default Button;
