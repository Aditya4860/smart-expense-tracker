import { useState, useEffect, useCallback } from 'react';
import { useCategory } from '../../context/CategoryContext';
import Button from '../ui/Button';
import CategorySelect from '../ui/CategorySelect';
import Select from '../ui/Select';

const FREQUENCY_OPTIONS = [
  { value: 'DAILY', label: 'Daily (Every day)' },
  { value: 'WEEKLY', label: 'Weekly (Every 7 days)' },
  { value: 'MONTHLY', label: 'Monthly (Every month)' },
  { value: 'QUARTERLY', label: 'Quarterly (Every 3 months)' },
  { value: 'YEARLY', label: 'Yearly (Every year)' },
];

const PAYMENT_METHODS = [
  'Bank Transfer',
  'UPI',
  'Credit Card',
  'Debit Card',
  'Auto Debit / NACH',
  'Cash',
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
  const { incomeCategories, expenseCategories } = useCategory();

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

  // Ensure category is updated if switching between Income and Expense
  const activeCategories = type === 'INCOME' ? incomeCategories : expenseCategories;
  useEffect(() => {
    if (activeCategories && activeCategories.length > 0) {
      const match = activeCategories.find((c) => c.id === categoryId);
      if (!match) {
        setCategoryId(activeCategories[0].id);
      }
    }
  }, [type, activeCategories, categoryId]);

  const handleTypeChange = (newType) => {
    setType(newType);
    const targetCategories = newType === 'INCOME' ? incomeCategories : expenseCategories;
    if (targetCategories && targetCategories.length > 0) {
      setCategoryId(targetCategories[0].id);
    } else {
      setCategoryId('');
    }
  };

  const validate = () => {
    const errs = {};
    if (!title.trim()) {
      errs.title = 'Schedule title is required';
    }
    if (!amount || Number(amount) <= 0) {
      errs.amount = 'Enter a valid amount greater than 0';
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
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      {/* Scrollable Form Body */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
        {/* Type Selector Tabs */}
        <div>
          <label className="block text-xs font-semibold text-surface-300 uppercase tracking-wider mb-2">
            Schedule Type
          </label>
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-surface-800 p-1.5 border border-surface-700">
            <button
              type="button"
              onClick={() => handleTypeChange('EXPENSE')}
              className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                type === 'EXPENSE'
                  ? 'bg-danger-500/20 text-danger-400 border border-danger-500/40 shadow-sm shadow-danger-500/10'
                  : 'text-surface-400 hover:text-white hover:bg-surface-700/50'
              }`}
            >
              <span>💸</span> Recurring Expense
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('INCOME')}
              className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                type === 'INCOME'
                  ? 'bg-success-500/20 text-success-400 border border-success-500/40 shadow-sm shadow-success-500/10'
                  : 'text-surface-400 hover:text-white hover:bg-surface-700/50'
              }`}
            >
              <span>💰</span> Recurring Income
            </button>
          </div>
        </div>

        {/* Title & Amount Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-surface-300 mb-1.5">
              Schedule Title <span className="text-danger-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={type === 'EXPENSE' ? 'e.g. Netflix, House Rent, Gym' : 'e.g. Salary, Client Retainer, Dividends'}
              className="input w-full"
              autoFocus
            />
            {errors.title && <p className="text-xs text-danger-400 mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-300 mb-1.5">
              Amount (₹) <span className="text-danger-400">*</span>
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
            {errors.amount && <p className="text-xs text-danger-400 mt-1">{errors.amount}</p>}
          </div>
        </div>

        {/* Category & Frequency Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="relative z-30">
            <label className="block text-xs font-semibold text-surface-300 mb-1.5">
              Category <span className="text-danger-400">*</span>
            </label>
            <CategorySelect
              id="recurring-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              error={errors.categoryId}
              type={type}
            />
            {errors.categoryId && <p className="text-xs text-danger-400 mt-1">{errors.categoryId}</p>}
          </div>

          <div className="relative z-20">
            <label className="block text-xs font-semibold text-surface-300 mb-1.5">
              Frequency <span className="text-danger-400">*</span>
            </label>
            <Select
              id="recurring-frequency"
              name="frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              options={FREQUENCY_OPTIONS}
            />
          </div>
        </div>

        {/* Start Date & End Date Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-surface-300 mb-1.5">
              Start Date <span className="text-danger-400">*</span>
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input w-full font-mono text-sm"
            />
            {errors.startDate && <p className="text-xs text-danger-400 mt-1">{errors.startDate}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-surface-300">
                End Date
              </label>
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isNeverEnding}
                  onChange={(e) => setIsNeverEnding(e.target.checked)}
                  className="rounded border-surface-600 bg-surface-800 text-primary-500 focus:ring-0 h-4 w-4 cursor-pointer"
                />
                <span className="text-xs text-surface-400 font-medium">Never ending</span>
              </label>
            </div>
            <input
              type="date"
              disabled={isNeverEnding}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={`input w-full font-mono text-sm ${
                isNeverEnding ? 'opacity-40 cursor-not-allowed bg-surface-950' : ''
              }`}
            />
            {errors.endDate && <p className="text-xs text-danger-400 mt-1">{errors.endDate}</p>}
          </div>
        </div>

        {/* Payment Method & Source / Vendor */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="relative z-10">
            <label className="block text-xs font-semibold text-surface-300 mb-1.5">
              Payment Method
            </label>
            <Select
              id="recurring-payment-method"
              name="paymentMethod"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              options={PAYMENT_METHODS.map((pm) => ({ value: pm, label: pm }))}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-300 mb-1.5">
              {type === 'EXPENSE' ? 'Merchant / Vendor' : 'Income Source'}
            </label>
            <input
              type="text"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              placeholder={type === 'EXPENSE' ? 'e.g. Netflix, Landlord, Society' : 'e.g. Employer Inc, Client ABC'}
              className="input w-full"
            />
          </div>
        </div>

        {/* Auto Process Toggle */}
        <div className="rounded-xl border border-surface-700 bg-surface-800/80 p-4 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-white">Auto-generate Transaction</p>
            <p className="text-xs text-surface-400 leading-relaxed">
              Automatically create the financial transaction and update budgets, goals, and analytics when due.
            </p>
          </div>
          <input
            type="checkbox"
            checked={autoProcess}
            onChange={(e) => setAutoProcess(e.target.checked)}
            className="h-5 w-5 rounded border-surface-600 bg-surface-800 text-primary-500 focus:ring-0 cursor-pointer flex-shrink-0"
          />
        </div>

        {/* Notes / Description */}
        <div>
          <label className="block text-xs font-semibold text-surface-300 mb-1.5">
            Description / Notes <span className="text-surface-500 font-normal">(Optional)</span>
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Additional details, account numbers, or reference notes..."
            className="input w-full text-sm resize-none"
          />
        </div>
      </div>

      {/* Action Buttons Footer */}
      <div className="flex-shrink-0 flex items-center justify-end gap-3 border-t border-surface-700/80 px-6 py-4 bg-surface-900 rounded-b-2xl">
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
