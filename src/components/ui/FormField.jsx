/**
 * FormField.jsx — shared micro-components for forms and table rows.
 *
 * Exports:
 *   FieldError  — inline validation error message
 *   FormLabel   — accessible label with required/optional indicators
 *   IconButton  — compact square icon-only button for table row actions
 */

// ── FieldError ─────────────────────────────────────────────────────────────

/**
 * Renders a red validation error below a field.
 * Returns null when `message` is falsy.
 *
 * Props:
 *   id      — string  links via aria-describedby on the input
 *   message — string | undefined
 */
export function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1 text-xs text-danger-400">
      {message}
    </p>
  );
}

// ── FormLabel ──────────────────────────────────────────────────────────────

/**
 * Accessible label with optional required (*) and optional-text indicators.
 *
 * Props:
 *   htmlFor  — string
 *   required — boolean  — renders a red asterisk
 *   optional — boolean  — renders "(optional)" in muted text
 */
export function FormLabel({ htmlFor, children, required, optional }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-slate-300">
      {children}
      {required && <span className="ml-0.5 text-danger-400" aria-hidden="true">*</span>}
      {optional && <span className="ml-1 text-xs font-normal text-slate-500">(optional)</span>}
    </label>
  );
}

// ── IconButton ─────────────────────────────────────────────────────────────

/**
 * Compact 28×28 icon-only button used in table rows for Edit / Delete actions.
 *
 * Props:
 *   onClick    — () => void
 *   label      — string  — aria-label for accessibility
 *   hoverClass — string  — Tailwind hover colour classes (e.g. "hover:bg-primary-500/10 hover:text-primary-400")
 *   children   — JSX SVG icon
 */
export function IconButton({ onClick, label, hoverClass, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={[
        'flex h-7 w-7 items-center justify-center rounded-lg',
        'text-slate-500 transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
        hoverClass,
      ].join(' ')}
    >
      {children}
    </button>
  );
}
