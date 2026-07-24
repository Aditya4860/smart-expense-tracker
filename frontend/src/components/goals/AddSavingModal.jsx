import { useState, useCallback } from 'react';
import Modal from '../ui/Modal';
import { FormLabel, FieldError } from '../ui/FormField';
import Button from '../ui/Button';
import CurrencyInput from '../ui/CurrencyInput';
import DatePicker from 'react-datepicker';

export default function AddSavingModal({ isOpen, onClose, onSubmit, goalTitle, loading = false }) {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      setError('Amount must be greater than zero');
      return;
    }
    setError('');
    
    // Convert to target schema
    onSubmit({
      amount: val,
      date: date.toISOString(),
      notes,
      type: 'custom'
    });
    
    // Reset form
    setAmount('');
    setNotes('');
    setDate(new Date());
  }, [amount, date, notes, onSubmit]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Add Saving to ${goalTitle || 'Goal'}`}>
      <form onSubmit={handleSubmit} className="flex flex-col h-full" id="add-saving-form">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <FormLabel htmlFor="asm-amount" required>Amount (₹)</FormLabel>
            <CurrencyInput
              id="asm-amount"
              name="amount"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setError(''); }}
              className="input h-10 w-full"
              aria-invalid={!!error}
            />
            {error && <FieldError message={error} />}
          </div>
          <div>
            <FormLabel htmlFor="asm-date" required>Date</FormLabel>
            <DatePicker
              id="asm-date"
              selected={date}
              onChange={(d) => setDate(d)}
              className="input h-10 w-full pl-3 text-sm"
              dateFormat="dd MMM yyyy"
              maxDate={new Date()}
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
            />
          </div>
          <div>
            <FormLabel htmlFor="asm-notes" optional>Notes</FormLabel>
            <textarea
              id="asm-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input resize-none py-2.5 text-sm w-full"
              rows={3}
              placeholder="e.g. Bonus, Sold old phone..."
            />
          </div>
        </div>
        <div className="flex-shrink-0 flex items-center justify-end gap-3 border-t border-surface-700/60 p-6 bg-surface-900 rounded-b-2xl sm:rounded-b-2xl">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" variant="primary" loading={loading}>Add Saving</Button>
        </div>
      </form>
    </Modal>
  );
}
