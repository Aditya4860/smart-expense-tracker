import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Select — A fully custom accessible dropdown component.
 * 
 * Props:
 *   id       - input ID
 *   name     - field name
 *   value    - current selected value
 *   options  - array of { value, label }
 *   onChange - (e) => void  (simulates native event)
 *   onBlur   - (e) => void
 *   error    - string/boolean for error state
 *   className- custom class
 */
export default function Select({ id, name, value, options, onChange, onBlur, error, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  
  const selectedOption = options.find(o => String(o.value) === String(value)) || options[0];

  const handleSelect = useCallback((optionValue) => {
    if (onChange) {
      onChange({ target: { name: name || id, value: optionValue } });
    }
    setIsOpen(false);
  }, [onChange, name, id]);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        onBlur?.({ target: { name: name || id } });
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen, onBlur, name, id]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      onBlur?.({ target: { name: name || id } });
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(prev => !prev);
    }
  };

  const handleOptionKeyDown = (e, optionValue) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelect(optionValue);
    }
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        id={id}
        type="button"
        className={[
          'input flex w-full h-10 items-center justify-between text-left text-sm',
          error ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20' : '',
        ].filter(Boolean).join(' ')}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="block truncate">{selectedOption?.label || 'Select...'}</span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-slate-400">
          <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
        </svg>
      </button>

      {isOpen && (
        <ul
          className="absolute left-0 right-0 z-[100] mt-1.5 max-h-64 w-full overflow-auto rounded-xl border border-surface-600 bg-surface-800 shadow-2xl py-1 text-sm text-white focus:outline-none"
          role="listbox"
          tabIndex={-1}
        >
          {options.map((opt) => {
            const isSelected = String(opt.value) === String(value);
            const isAction = opt.isAction || opt.value === 'create_new';

            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                tabIndex={0}
                onClick={() => handleSelect(opt.value)}
                onKeyDown={(e) => handleOptionKeyDown(e, opt.value)}
                className={[
                  'cursor-pointer px-4 py-2.5 transition-colors flex items-center justify-between',
                  isAction
                    ? 'border-t border-surface-700/80 mt-1 text-primary-400 font-semibold hover:bg-primary-500/20 hover:text-primary-300 pl-4 sticky bottom-0 bg-surface-800'
                    : isSelected 
                    ? 'bg-primary-500/20 text-primary-400 font-semibold border-l-4 border-primary-500 pl-3' 
                    : 'text-slate-200 hover:bg-surface-700 hover:text-white pl-4'
                ].join(' ')}
              >
                <span className="truncate flex items-center gap-2">{opt.label}</span>
                {isSelected && !isAction && (
                  <svg className="h-4 w-4 text-primary-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
