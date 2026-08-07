import { useState, useEffect } from 'react';
import { useCategory } from '../../context/CategoryContext';
import Button from '../ui/Button';

const FREQUENCY_OPTIONS = [
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'YEARLY', label: 'Yearly' },
];

const PAYMENT_METHODS = [
  'Credit Card',
  'Debit Card',
  'Bank Transfer',
  'UPI',
  'Cash',
  'Auto Debit / NACH',
  'PayPal',
  'Other',
];

export default function RecurringForm({
  initialData = null,
  defaultType = 'EXPENSE',
  onSubmit,
  onCancel,
  loading = false,
}) {
  const { categories } = useCategory();

  const [type, setType] = useState(initialData?.type || defaultType);
  const [title, setTitle] = useState(initialData?.title || '');
  const [amount, setAmount] = useState(initialData?.amount || '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
  const [frequency, setFrequency] = useState(initialData?.frequency || 'MONTHLY');
  const [startDate, setStartDate] = useState(
    initialData?.startDate || new Date().toISOString().split('T')[0]
  );
  const [isNeverEnding, setIsNeverEnding] = useState(
    initialData?.isNeverEnding !== undefined ? initialData.isNeverEnding : true
  );
  const [endDate, setEndDate] = useState(initialData?.endDate || '');
  const [autoProcess, setAutoProcess] = useState(
    initialData?.autoProcess !== undefined ? initialData.autoProcess : true
  );
  const [merchant, setMerchant] = useState(initialData?.merchant || '');
  const [paymentMethod, setPaymentMethod] = useState(
    initialData?.paymentMethod || 'Bank Transfer'
  );
  const [description, setDescription] = useState(initialData?.description || '');
  const [errors, setErrors] = useState({});

  // Filter categories by type
  const relevantCategories = categories.filter((c) => c.type === type);

  // Set default category when type changes or categories load
  useEffect(() => {
    if (!categoryId && relevantCategories.length > 0) {
      setCategoryId(relevantCategories[0].id);
    } else if (categoryId) {
      const match = relevantCategories.find((c) => c.id === categoryId);
      if (!match && relevantCategories.length > 0) {
        setCategoryId(relevantCategories[0].id);
      }
    }
  }, [type, relevantCategories, categoryId]);

  const validate = () => {
    const errs = {};
    if (!title.trim()) {
      errs.title = 'Title is required';
    }
    if (!amount || Number(amount) <= 0) {
      errs.amount = 'Valid amount greater than 0 is required';
    }
    if (!categoryId) {
      errs.categoryId = 'Please select a category';
    }
    if (!startDate) {
      errs.startDate = 'Start date is required';
    }
    if (!isNeverEnding && !endDate) {
      errs.endDate = 'End date is required when not set to never-ending';
    }
    if (!isNeverEnding && endDate && startDate && new Date(endDate) < new Date(startDate)) {
      errs.endDate = 'End date cannot be before start date';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      type,
      title: title.trim(),
      amount: parseFloat(amount),
      categoryId,
      frequency,
      startDate,
      isNeverEnding,
      endDate: isNeverEnding ? null : endDate,
      autoProcess,
      merchant: merchant.trim() || null,
      paymentMethod: paymentMethod || null,
      description: description.trim() || null,
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type Selector Tabs */}
      <div className="flex rounded-xl bg-surface-800 p-1 border border-surface-700">
        <button
          type="button"
          onClick={() => setType('EXPENSE')}
          className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
            type === 'EXPENSE'
              ? 'bg-danger-500/20 text-danger-400 border border-danger-500/30 shadow-sm'
              : 'text-surface-400 hover:text-white'
          }`}
        >
          💸 Recurring Expense
        </button>
        <button
          type="button"
          onClick={() => setType('INCOME')}
          className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
            type === 'INCOME'
              ? 'bg-success-500/20 text-success-400 border border-success-500/30 shadow-sm'
              : 'text-surface-400 hover:text-white'
          }`}
        >
          💰 Recurring Income
        </button>
      </div>

      {/* Title & Amount */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-surface-300 mb-1">
            Schedule Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={type === 'EXPENSE' ? 'e.g. Netflix Subscription, House Rent' : 'e.g. Salary, Consulting Retainer'}
            className="input w-full"
            autoFocus
          />
          {errors.title && <p className="text-[11px] text-red-400 mt-1">{errors.title}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-surface-300 mb-1">
            Amount (₹) <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="input w-full tabular-nums font-mono"
          />
          {errors.amount && <p className="text-[11px] text-red-400 mt-1">{errors.amount}</p>}
        </div>
      </div>

      {/* Category & Frequency */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-surface-300 mb-1">
            Category <span className="text-red-400">*</span>
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="input w-full"
          >
            {relevantCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon || '🏷️'} {cat.name}
              </option>
            ))}
          </select>
          {errors.categoryId && <p className="text-[11px] text-red-400 mt-1">{errors.categoryId}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-surface-300 mb-1">
            Frequency <span className="text-red-400">*</span>
          </label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="input w-full font-medium"
          >
            {FREQUENCY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Start Date & End Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-surface-300 mb-1">
            Start Date <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="input w-full font-mono text-xs"
          />
          {errors.startDate && <p className="text-[11px] text-red-400 mt-1">{errors.startDate}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-surface-300">
              End Date
            </label>
            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isNeverEnding}
                onChange={(e) => setIsNeverEnding(e.target.checked)}
                className="rounded border-surface-600 bg-surface-800 text-brand-500 focus:ring-0 h-3.5 w-3.5"
              />
              <span className="text-[11px] text-surface-400">Never ending</span>
            </label>
          </div>
          <input
            type="date"
            disabled={isNeverEnding}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={`input w-full font-mono text-xs ${
              isNeverEnding ? 'opacity-40 cursor-not-allowed bg-surface-900' : ''
            }`}
          />
          {errors.endDate && <p className="text-[11px] text-red-400 mt-1">{errors.endDate}</p>}
        </div>
      </div>

      {/* Payment Method & Merchant / Source */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-surface-300 mb-1">
            Payment Method
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="input w-full text-xs"
          >
            {PAYMENT_METHODS.map((pm) => (
              <option key={pm} value={pm}>
                {pm}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-surface-300 mb-1">
            {type === 'EXPENSE' ? 'Merchant / Vendor' : 'Income Source'}
          </label>
          <input
            type="text"
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
            placeholder={type === 'EXPENSE' ? 'e.g. Netflix, Landlord' : 'e.g. Acme Corp, Client XYZ'}
            className="input w-full text-xs"
          />
        </div>
      </div>

      {/* Auto Process Toggle */}
      <div className="rounded-xl border border-surface-700/80 bg-surface-800/60 p-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-white">Auto-generate Transaction</p>
          <p className="text-[11px] text-surface-400">
            Automatically create the financial transaction and update budgets/analytics when due.
          </p>
        </div>
        <input
          type="checkbox"
          checked={autoProcess}
          onChange={(e) => setAutoProcess(e.target.checked)}
          className="h-4 w-4 rounded border-surface-600 bg-surface-800 text-brand-500 focus:ring-0 cursor-pointer"
        />
      </div>

      {/* Notes / Description */}
      <div>
        <label className="block text-xs font-semibold text-surface-300 mb-1">
          Description / Notes (Optional)
        </label>
        <textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Additional details about this recurring schedule..."
          className="input w-full text-xs"
        />
      </div>

      {/* Form Buttons */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-700">
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={loading}
        >
          {loading ? 'Saving...' : initialData ? 'Update Schedule' : 'Create Recurring Schedule'}
        </Button>
      </div>
    </form>
  );
}
