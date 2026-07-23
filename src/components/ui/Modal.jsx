/**
 * Modal.jsx — generic accessible modal dialog rendered via React portal.
 *
 * Features:
 *   - Escape key closes the modal
 *   - Backdrop click closes the modal
 *   - Body scroll locked while open
 *   - First interactive element receives focus on open
 *   - Bottom-sheet on mobile, centred panel on sm+
 *
 * Props:
 *   isOpen   — boolean
 *   onClose  — () => void
 *   title    — string shown in the modal header
 *   titleId  — string  aria-labelledby id (default: 'modal-title')
 *   children — modal body content
 */

import { useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

const CLOSE_ICON = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
    fill="currentColor"
    className="h-4 w-4"
    aria-hidden="true"
  >
    <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
  </svg>
);

export default function Modal({ isOpen, onClose, title, titleId = 'modal-title', children }) {
  const panelRef = useRef(null);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    panelRef.current?.querySelector(FOCUSABLE)?.focus();
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={[
          'relative z-10 w-full bg-surface-900',
          'border border-surface-700',
          'rounded-t-[10px] sm:rounded-[10px]',
          'shadow-2xl shadow-black/50',
          'sm:max-w-[900px]',
          'max-h-[92dvh] flex flex-col w-[95vw]',
        ].join(' ')}
      >
        {/* Mobile drag handle */}
        <div
          className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-surface-700 sm:hidden"
          aria-hidden="true"
        />

        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-surface-700/60 px-6 py-4">
          <h2 id={titleId} className="text-base font-semibold text-white">
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className={[
              'flex h-8 w-8 items-center justify-center rounded-[8px]',
              'text-surface-400 transition-colors',
              'hover:bg-surface-800 hover:text-white',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
            ].join(' ')}
            aria-label="Close modal"
          >
            {CLOSE_ICON}
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 flex flex-col">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
