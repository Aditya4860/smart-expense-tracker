import { memo } from 'react';

/**
 * Skeleton — animated loading placeholder block.
 *
 * Props:
 *   className — Tailwind sizing/shape classes  (required for meaningful output)
 *   rounded   — 'sm' | 'md' | 'lg' | 'xl' | 'full'  (default: 'lg')
 *
 * Usage:
 *   <Skeleton className="h-4 w-32" />
 *   <Skeleton className="h-10 w-full" rounded="xl" />
 */
const ROUND_MAP = {
  sm:   'rounded',
  md:   'rounded-md',
  lg:   'rounded-lg',
  xl:   'rounded-xl',
  '2xl':'rounded-2xl',
  full: 'rounded-full',
};

const Skeleton = memo(function Skeleton({ className = '', rounded = 'lg' }) {
  return (
    <div
      role="presentation"
      aria-hidden="true"
      className={[
        'animate-pulse bg-surface-700/60',
        ROUND_MAP[rounded] ?? ROUND_MAP.lg,
        className,
      ].join(' ')}
    />
  );
});

export default Skeleton;
