import { memo } from 'react';

const PADDING = { none: '', sm: 'p-4', md: 'p-5', lg: 'p-6' };

/**
 * Card — surface container with consistent border, background and shadow.
 *
 * Props:
 *   as       — HTML tag to render (default: 'div')
 *   padding  — 'none' | 'sm' | 'md' | 'lg'  (default: 'md')
 *   hover    — boolean  adds hover lift + border brightening
 *   glass    — boolean  uses glass-morphism style instead of solid surface
 *   className — additional Tailwind classes
 *   children  — card content
 */
const Card = memo(function Card({
  as: Tag    = 'div',
  padding    = 'md',
  hover      = false,
  glass      = false,
  className  = '',
  children,
  ...rest
}) {
  const base = [
    glass
      ? 'rounded-[10px] border border-white/10 bg-white/5 backdrop-blur-md'
      : 'rounded-[10px] border-[1.5px] border-surface-700 bg-surface-800',
    'shadow-card-dark',
    PADDING[padding] ?? PADDING.md,
    hover
      ? 'transition-all duration-200 hover:border-surface-600 hover:-translate-y-0.5 hover:shadow-float cursor-pointer'
      : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <Tag className={base} {...rest}>
      {children}
    </Tag>
  );
});

export default Card;
