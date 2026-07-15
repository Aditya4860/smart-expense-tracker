/**
 * expenseCategories.js — canonical list of expense categories.
 * Each category has an id, label, colour tokens, and an inline SVG icon element.
 */

export const CATEGORIES = [
  {
    id:      'food',
    label:   'Food & Dining',
    color:   'text-orange-400',
    bg:      'bg-orange-500/15',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
        <path d="M10 1a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 1ZM5.05 3.05a.75.75 0 0 1 1.06 0l1.062 1.06A.75.75 0 1 1 6.11 5.173L5.05 4.11a.75.75 0 0 1 0-1.06ZM14.95 3.05a.75.75 0 0 1 0 1.06l-1.06 1.06a.75.75 0 0 1-1.062-1.061l1.061-1.06a.75.75 0 0 1 1.06 0ZM3 8.75A.75.75 0 0 1 3.75 8h12.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 8.75ZM6 13a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-4Z" />
      </svg>
    ),
  },
  {
    id:      'transport',
    label:   'Transport',
    color:   'text-blue-400',
    bg:      'bg-blue-500/15',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
        <path d="M6.5 3A1.5 1.5 0 0 0 5 4.5v.088a3.5 3.5 0 0 0-3 3.456V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8.044A3.5 3.5 0 0 0 13 4.588V4.5A1.5 1.5 0 0 0 11.5 3h-5ZM7.5 12a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" />
      </svg>
    ),
  },
  {
    id:      'shopping',
    label:   'Shopping',
    color:   'text-pink-400',
    bg:      'bg-pink-500/15',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
        <path fillRule="evenodd" d="M6 5v1H4.667a1.75 1.75 0 0 0-1.743 1.598l-.826 9.5A1.75 1.75 0 0 0 3.84 19H16.16a1.75 1.75 0 0 0 1.743-1.902l-.826-9.5A1.75 1.75 0 0 0 15.333 6H14V5a4 4 0 0 0-8 0Zm4-2.5A2.5 2.5 0 0 0 7.5 5v1h5V5A2.5 2.5 0 0 0 10 2.5ZM7.5 10a2.5 2.5 0 0 0 5 0V8.75a.75.75 0 0 1 1.5 0V10a4 4 0 0 1-8 0V8.75a.75.75 0 0 1 1.5 0V10Z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    id:      'health',
    label:   'Health & Medical',
    color:   'text-red-400',
    bg:      'bg-red-500/15',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
        <path d="M11 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9.25 7.5a.75.75 0 0 0 0 1.5h.25v4.25a.75.75 0 0 0 1.5 0V8.25a.75.75 0 0 0-.75-.75H9.25Z" />
        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm0-1.5a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13Z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    id:      'entertainment',
    label:   'Entertainment',
    color:   'text-purple-400',
    bg:      'bg-purple-500/15',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
        <path d="M15.5 2h-11A2.5 2.5 0 0 0 2 4.5v11A2.5 2.5 0 0 0 4.5 18h11a2.5 2.5 0 0 0 2.5-2.5v-11A2.5 2.5 0 0 0 15.5 2ZM8.22 14.03 6.5 12.31V9.5a.75.75 0 0 1 1.5 0v2.19l1.47 1.47a.75.75 0 0 1-1.25.87ZM14 9.75a.75.75 0 0 1-.75.75H11.5a.75.75 0 0 1 0-1.5h1.75A.75.75 0 0 1 14 9.75Z" />
      </svg>
    ),
  },
  {
    id:      'utilities',
    label:   'Utilities & Bills',
    color:   'text-yellow-400',
    bg:      'bg-yellow-500/15',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
        <path fillRule="evenodd" d="M14.5 10a4.5 4.5 0 0 0 4.284-5.882c-.105-.324-.51-.391-.752-.15L15.34 6.66a.454.454 0 0 1-.493.11 3.01 3.01 0 0 1-1.618-1.616.455.455 0 0 1 .11-.494l2.694-2.692c.24-.241.174-.647-.15-.752a4.5 4.5 0 0 0-5.873 4.575c.055.873-.128 1.808-.8 2.368l-7.23 6.024a2.724 2.724 0 1 0 3.837 3.837l6.024-7.23c.56-.672 1.495-.855 2.368-.8.096.007.193.01.291.01ZM5 16a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    id:      'education',
    label:   'Education',
    color:   'text-cyan-400',
    bg:      'bg-cyan-500/15',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
        <path d="M10.394 2.08a1 1 0 0 0-.788 0l-7 3a1 1 0 0 0 0 1.84L5.25 8.051a.999.999 0 0 1 .356-.257l4-1.714a1 1 0 1 1 .788 1.838L7.667 9.088l1.94.831a1 1 0 0 0 .787 0l7-3a1 1 0 0 0 0-1.838l-7-3ZM3.31 9.397 5 10.12v4.102a8.969 8.969 0 0 0-1.05-.174 1 1 0 0 1-.89-.89 11.115 11.115 0 0 1 .25-3.762ZM9.3 16.573A9.026 9.026 0 0 0 7 14.935v-3.957l1.818.778a2 2 0 0 0 1.564 0l1.818-.778v3.957a9.026 9.026 0 0 0-2.9 1.638ZM15 11.021l-3 1.285V14.5a9.023 9.023 0 0 1 1.05.174 1 1 0 0 0 .89-.89A11.115 11.115 0 0 0 14 10.12l1-.428v1.33Z" />
      </svg>
    ),
  },
  {
    id:      'travel',
    label:   'Travel',
    color:   'text-teal-400',
    bg:      'bg-teal-500/15',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
        <path d="M10 2a.75.75 0 0 1 .75.75v1.258a32.987 32.987 0 0 1 3.476.422.75.75 0 0 1-.297 1.47 31.43 31.43 0 0 0-3.942-.358l.003 1.833c0 1.244-.467 1.96-1.308 2.427.841.467 1.308 1.183 1.308 2.427l-.003 1.834c1.385-.018 2.68-.148 3.942-.358a.75.75 0 0 1 .297 1.47 32.987 32.987 0 0 1-3.476.422V17.25a.75.75 0 0 1-1.5 0v-1.258a32.987 32.987 0 0 1-3.476-.422.75.75 0 0 1 .297-1.47c1.262.21 2.557.34 3.942.358L9.25 12.5c0-1.244.467-1.96 1.308-2.427C9.717 9.606 9.25 8.89 9.25 7.646l.003-1.833a31.43 31.43 0 0 0-3.942.358.75.75 0 0 1-.297-1.47 32.987 32.987 0 0 1 3.476-.422V2.75A.75.75 0 0 1 10 2Z" />
      </svg>
    ),
  },
  {
    id:      'housing',
    label:   'Housing & Rent',
    color:   'text-indigo-400',
    bg:      'bg-indigo-500/15',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
        <path fillRule="evenodd" d="M9.293 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 17 11h-1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6H3a1 1 0 0 1-.707-1.707l7-7Z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    id:      'other',
    label:   'Other',
    color:   'text-slate-400',
    bg:      'bg-slate-500/15',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
        <path d="M3 10a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM8.5 10a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM15.5 8.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" />
      </svg>
    ),
  },
];

/** Map keyed by category id for O(1) lookup. */
export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));

/** Category ids only — used for select options. */
export const CATEGORY_IDS = CATEGORIES.map(c => c.id);

export const PAYMENT_METHODS = [
  { id: 'cash',          label: 'Cash' },
  { id: 'debit_card',   label: 'Debit Card' },
  { id: 'credit_card',  label: 'Credit Card' },
  { id: 'upi',          label: 'UPI' },
  { id: 'net_banking',  label: 'Net Banking' },
  { id: 'wallet',       label: 'Wallet' },
];

export const PAYMENT_METHOD_MAP = Object.fromEntries(PAYMENT_METHODS.map(p => [p.id, p]));
