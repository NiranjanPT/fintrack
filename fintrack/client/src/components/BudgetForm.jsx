import { useState } from 'react';
import ErrorMessage from './ErrorMessage';
import useFinance from '../hooks/useFinance';
import { MONTHS } from '../utils/format';
import { getYearOptions } from '../utils/constants';

export default function BudgetForm({ budget, onSubmit, onCancel }) {
  const { expenseCategories, selectedMonth, selectedYear } = useFinance();
  const [form, setForm] = useState({
    category: budget?.category?._id || '',
    month: budget?.month || selectedMonth,
    year: budget?.year || selectedYear,
    limit: budget?.limit ?? '',
    alertThreshold: budget?.alertThreshold ?? 80,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.category) return setError('Please select a category');
    if (!(Number(form.limit) > 0)) return setError('Budget limit must be greater than 0');

    setSubmitting(true);
    try {
      await onSubmit({
        category: form.category,
        month: Number(form.month),
        year: Number(form.year),
        limit: Number(form.limit),
        alertThreshold: Number(form.alertThreshold),
      });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <ErrorMessage message={error} />
      <div className="form-grid">
        <label className="field field-full">
          <span>Category *</span>
          <select name="category" value={form.category} onChange={handleChange} required>
            <option value="">Select expense category</option>
            {expenseCategories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Month *</span>
          <select name="month" value={form.month} onChange={handleChange}>
            {MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Year *</span>
          <select name="year" value={form.year} onChange={handleChange}>
            {getYearOptions().map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Monthly limit (₹) *</span>
          <input name="limit" type="number" min="1" step="1" value={form.limit} onChange={handleChange} placeholder="5000" required />
        </label>
        <label className="field">
          <span>Warning alert at (%)</span>
          <input name="alertThreshold" type="number" min="1" max="100" value={form.alertThreshold} onChange={handleChange} />
          <small className="field-hint">An "exceeded" alert is always shown at 100%</small>
        </label>
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving...' : budget ? 'Update budget' : 'Create budget'}
        </button>
      </div>
    </form>
  );
}
