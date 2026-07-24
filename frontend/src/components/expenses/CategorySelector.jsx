import CATEGORIES from '../../constants/categories';

/**
 * CategorySelector — controlled pill-grid for picking an expense category.
 *
 * Props:
 *   value    — currently selected category id (string)
 *   onChange — (id: string) => void
 *   error    — optional validation error message
 */
export default function CategorySelector({ value, onChange, error }) {
  return (
    <div>
      <div
        role="radiogroup"
        aria-label="Expense category"
        className="grid grid-cols-3 gap-2 sm:grid-cols-4"
      >
        {CATEGORIES.map(cat => {
          const isSelected = value === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              id={`category-${cat.id}`}
              onClick={() => onChange(cat.id)}
              className={[
                'flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3',
                'text-xs font-medium transition-all duration-200',
                'hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-primary-500/60',
                isSelected
                  ? 'border-primary-500 bg-primary-600/20 text-primary-300 shadow-glow-primary/30'
                  : 'border-surface-700 bg-surface-800 text-slate-400 hover:border-surface-600 hover:text-slate-300',
              ].join(' ')}
            >
              <span className="text-xl leading-none" aria-hidden="true">
                {cat.icon}
              </span>
              <span className="text-center leading-tight">{cat.label}</span>
            </button>
          );
        })}
      </div>

      {error && (
        <p className="mt-1.5 text-xs text-danger-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
