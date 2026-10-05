import { useEffect, useState } from 'react';
import ErrorMessage from './ErrorMessage';
import useFinance from '../hooks/useFinance';
import useDebounce from '../hooks/useDebounce';
import categoryService from '../services/categoryService';
import { PAYMENT_METHODS, RECURRING_FREQUENCIES } from '../utils/constants';
import { toInputDate, todayInputDate } from '../utils/format';

const buildInitialForm = (transaction, defaultType) => ({
  type: transaction?.type || defaultType,
  title: transaction?.title || '',
  amount: transaction?.amount ?? '',
  category: transaction?.category?._id || '',
  date: transaction ? toInputDate(transaction.date) : todayInputDate(),
  paymentMethod: transaction?.paymentMethod || 'upi',
  description: transaction?.description || '',
  isRecurring: transaction?.isRecurring || false,
  frequency: transaction?.recurrence?.frequency || 'monthly',
  nextOccurrence: toInputDate(transaction?.recurrence?.nextOccurrence),
  recurringStatus: transaction?.recurrence?.status || 'active',
});

// Add / edit form for income and expenses
export default function TransactionForm({ transaction, defaultType = 'expense', onSubmit, onCancel }) {
  const isEdit = Boolean(transaction);
  const { expenseCategories, incomeCategories } = useFinance();

  const [form, setForm] = useState(() => buildInitialForm(transaction, defaultType));
  const [suggestion, setSuggestion] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const categories = form.type === 'income' ? incomeCategories : expenseCategories;
  const debouncedText = useDebounce(`${form.title} ${form.description}`.trim(), 400);

  // Automatic categorization preview: ask the backend which category the title matches
  useEffect(() => {
    if (isEdit || !debouncedText) {
      setSuggestion(null);
      return undefined;
    }
    let ignore = false;
    categoryService
      .suggest(debouncedText, form.type)
      .then((category) => !ignore && setSuggestion(category))
      .catch(() => !ignore && setSuggestion(null));
    return () => {
      ignore = true;
    };
  }, [debouncedText, form.type, isEdit]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => {
      const next = { ...prev, [name]: type === 'checkbox' ? checked : value };
      if (name === 'type') next.category = ''; // categories differ for income/expense
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.title.trim()) return setError('Title is required');
    if (!(Number(form.amount) > 0)) return setError('Amount must be greater than 0');
    if (isEdit && !form.category) return setError('Please select a category');

    const payload = {
      type: form.type,
      title: form.title.trim(),
      amount: Number(form.amount),
      date: form.date,
      paymentMethod: form.paymentMethod,
      description: form.description.trim(),
      isRecurring: form.isRecurring,
    };
    // Empty category = let the backend categorize automatically
    if (form.category) payload.category = form.category;
    if (form.isRecurring) {
      payload.recurrence = {
        frequency: form.frequency,
        status: form.recurringStatus,
        ...(form.nextOccurrence ? { nextOccurrence: form.nextOccurrence } : {}),
      };
    }

    setSubmitting(true);
    try {
      await onSubmit(payload);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <ErrorMessage message={error} />

      <div className="segmented" role="radiogroup" aria-label="Transaction type">
        {['expense', 'income'].map((type) => (
          <label key={type} className={`segment ${form.type === type ? `active ${type}` : ''}`}>
            <input type="radio" name="type" value={type} checked={form.type === type} onChange={handleChange} />
            {type === 'expense' ? 'Expense' : 'Income'}
          </label>
        ))}
      </div>

      <div className="form-grid">
        <label className="field">
          <span>Title *</span>
          <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Pizza, Uber, Salary" maxLength={100} required />
        </label>

        <label className="field">
          <span>Amount (₹) *</span>
          <input name="amount" type="number" min="0.01" step="0.01" value={form.amount} onChange={handleChange} placeholder="0.00" required />
        </label>

        <label className="field">
          <span>Category</span>
          <select name="category" value={form.category} onChange={handleChange}>
            {isEdit ? <option value="">Select category</option> : <option value="">Auto-detect from title</option>}
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
          {!isEdit && !form.category && (
            <small className="field-hint">
              {suggestion
                ? `Auto-detected: ${suggestion.name}`
                : form.title
                  ? `No keyword match - will use "${form.type === 'income' ? 'Other Income' : 'Other'}"`
                  : 'Category is chosen automatically from keywords'}
            </small>
          )}
        </label>

        <label className="field">
          <span>Date *</span>
          <input name="date" type="date" value={form.date} onChange={handleChange} required />
        </label>

        <label className="field">
          <span>Payment method</span>
          <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange}>
            {PAYMENT_METHODS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field field-full">
          <span>Description</span>
          <textarea name="description" rows={2} value={form.description} onChange={handleChange} maxLength={500} placeholder="Optional notes" />
        </label>
      </div>

      <label className="checkbox">
        <input type="checkbox" name="isRecurring" checked={form.isRecurring} onChange={handleChange} />
        <span>Recurring {form.type} (rent, internet, gym, loan...)</span>
      </label>

      {form.isRecurring && (
        <div className="form-grid recurring-box">
          <label className="field">
            <span>Frequency</span>
            <select name="frequency" value={form.frequency} onChange={handleChange}>
              {RECURRING_FREQUENCIES.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Next occurrence</span>
            <input name="nextOccurrence" type="date" value={form.nextOccurrence} onChange={handleChange} />
            <small className="field-hint">Leave empty to calculate from the date</small>
          </label>
          <label className="field">
            <span>Status</span>
            <select name="recurringStatus" value={form.recurringStatus} onChange={handleChange}>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
            </select>
          </label>
        </div>
      )}

      <div className="form-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving...' : isEdit ? 'Update transaction' : 'Add transaction'}
        </button>
      </div>
    </form>
  );
}
