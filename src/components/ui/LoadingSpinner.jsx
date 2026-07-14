import { memo } from 'react';

/**
 * LoadingSpinner — accessible animated spinner.
 *
 * Props:
 *   size    — 'sm' | 'md' | 'lg'  (default: 'md')
 *   label   — sr-only text for screen readers (default: 'Loading…')
 *   className — additional classes on the wrapper
 */
const SIZE_MAP = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' };

const LoadingSpinner = memo(function LoadingSpinner({
  size      = 'md',
  label     = 'Loading…',
  className = '',
}) {
  return (
    <span
      role="status"
      aria-label={label}
      className={['inline-flex items-center justify-center', className].join(' ')}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        className={['animate-spin text-primary-400', SIZE_MAP[size] ?? SIZE_MAP.md].join(' ')}
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12" cy="12" r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  );
});

export default LoadingSpinner;
