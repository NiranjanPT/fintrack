import { useState } from 'react';
import ErrorMessage from './ErrorMessage';
import { toInputDate } from '../utils/format';

export default function SavingsGoalForm({ goal, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    name: goal?.name || '',
    targetAmount: goal?.targetAmount ?? '',
    currentAmount: goal?.currentAmount ?? 0,
    deadline: toInputDate(goal?.deadline),
    description: goal?.description || '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) return setError('Goal name is required');
    if (!(Number(form.targetAmount) > 0)) return setError('Target amount must be greater than 0');
    if (Number(form.currentAmount) < 0) return setError('Current amount cannot be negative');

    setSubmitting(true);
    try {
      await onSubmit({
        name: form.name.trim(),
        targetAmount: Number(form.targetAmount),
        currentAmount: Number(form.currentAmount) || 0,
        deadline: form.deadline,
        description: form.description.trim(),
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
          <span>Goal name *</span>
          <input name="name" value={form.name} onChange={handleChange} placeholder="Emergency fund, New laptop..." maxLength={60} required />
        </label>
        <label className="field">
          <span>Target amount (₹) *</span>
          <input name="targetAmount" type="number" min="1" step="0.01" value={form.targetAmount} onChange={handleChange} required />
        </label>
        <label className="field">
          <span>Current amount (₹)</span>
          <input name="currentAmount" type="number" min="0" step="0.01" value={form.currentAmount} onChange={handleChange} />
        </label>
        <label className="field">
          <span>Deadline</span>
          <input name="deadline" type="date" value={form.deadline} onChange={handleChange} />
        </label>
        <label className="field field-full">
          <span>Description</span>
          <textarea name="description" rows={2} value={form.description} onChange={handleChange} maxLength={300} />
        </label>
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving...' : goal ? 'Update goal' : 'Create goal'}
        </button>
      </div>
    </form>
  );
}
