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
    <label htmlFor={htmlFor} className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-slate-400">
      {children}
      {required && <span className="ml-0.5 text-danger-400" aria-hidden="true">*</span>}
      {optional && <span className="ml-1 text-[10px] font-normal text-slate-500 normal-case">(optional)</span>}
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

// ── Icons ──────────────────────────────────────────────────────────────────

export const EDIT_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
    <path d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L6.75 6.774a2.75 2.75 0 0 0-.596.892l-.848 2.047a.75.75 0 0 0 .98.98l2.047-.848a2.75 2.75 0 0 0 .892-.596l4.261-4.263a1.75 1.75 0 0 0 0-2.474Z" />
    <path d="M4.75 3.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h6.5c.69 0 1.25-.56 1.25-1.25V9a.75.75 0 0 1 1.5 0v2.25A2.75 2.75 0 0 1 11.25 14h-6.5A2.75 2.75 0 0 1 2 11.25v-6.5A2.75 2.75 0 0 1 4.75 2H7a.75.75 0 0 1 0 1.5H4.75Z" />
  </svg>
);

export const DELETE_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
    <path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5a.75.75 0 0 1 .786-.711Z" clipRule="evenodd" />
  </svg>
);

