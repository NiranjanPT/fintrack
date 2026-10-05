import { useState } from 'react';
import ErrorMessage from './ErrorMessage';
import useFinance from '../hooks/useFinance';
import { BILLING_CYCLES, SUBSCRIPTION_STATUSES } from '../utils/constants';
import { toInputDate, todayInputDate } from '../utils/format';

export default function SubscriptionForm({ subscription, onSubmit, onCancel }) {
  const { expenseCategories } = useFinance();
  const defaultCategory = expenseCategories.find((c) => c.name === 'Entertainment')?._id || '';

  const [form, setForm] = useState({
    name: subscription?.name || '',
    amount: subscription?.amount ?? '',
    billingCycle: subscription?.billingCycle || 'monthly',
    nextBillingDate: subscription ? toInputDate(subscription.nextBillingDate) : todayInputDate(),
    category: subscription?.category?._id || defaultCategory,
    status: subscription?.status || 'active',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) return setError('Name is required');
    if (!(Number(form.amount) > 0)) return setError('Amount must be greater than 0');
    if (!form.category) return setError('Please select a category');

    setSubmitting(true);
    try {
      await onSubmit({ ...form, name: form.name.trim(), amount: Number(form.amount) });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <ErrorMessage message={error} />
      <div className="form-grid">
        <label className="field">
          <span>Name *</span>
          <input name="name" value={form.name} onChange={handleChange} placeholder="Netflix, Spotify..." maxLength={60} required />
        </label>
        <label className="field">
          <span>Amount (₹) *</span>
          <input name="amount" type="number" min="0.01" step="0.01" value={form.amount} onChange={handleChange} required />
        </label>
        <label className="field">
          <span>Billing cycle</span>
          <select name="billingCycle" value={form.billingCycle} onChange={handleChange}>
            {BILLING_CYCLES.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Next billing date *</span>
          <input name="nextBillingDate" type="date" value={form.nextBillingDate} onChange={handleChange} required />
        </label>
        <label className="field">
          <span>Category *</span>
          <select name="category" value={form.category} onChange={handleChange} required>
            <option value="">Select category</option>
            {expenseCategories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Status</span>
          <select name="status" value={form.status} onChange={handleChange}>
            {SUBSCRIPTION_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving...' : subscription ? 'Update subscription' : 'Add subscription'}
        </button>
      </div>
    </form>
  );
}
