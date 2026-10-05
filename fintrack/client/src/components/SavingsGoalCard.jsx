import { useState } from 'react';
import Icon from './Icon';
import ProgressBar from './ProgressBar';
import StatusBadge from './StatusBadge';
import { formatCurrency, formatDate } from '../utils/format';

const daysLeft = (deadline) => {
  if (!deadline) return null;
  const today = new Date();
  const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.ceil((new Date(deadline).getTime() - todayUTC) / (24 * 60 * 60 * 1000));
};

export default function SavingsGoalCard({ goal, onEdit, onDelete, onAddMoney, compact = false }) {
  const [amount, setAmount] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  const { name, description, targetAmount, currentAmount, remainingAmount, progress, deadline, isCompleted } = goal;
  const remainingDays = daysLeft(deadline);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!(Number(amount) > 0)) return setError('Enter an amount greater than 0');
    setError('');
    setAdding(true);
    try {
      await onAddMoney(goal, Number(amount));
      setAmount('');
    } catch (err) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className={`goal-card ${compact ? 'compact' : ''}`}>
      <div className="goal-top">
        <div>
          <strong className="goal-name">{name}</strong>
          {!compact && description && <p className="muted goal-desc">{description}</p>}
        </div>
        {isCompleted ? <StatusBadge status="completed" /> : <span className="goal-percent">{progress}%</span>}
      </div>

      <ProgressBar value={progress} status={isCompleted ? 'ok' : 'goal'} label={`${name} progress`} />

      <div className="budget-figures">
        <span>
          <strong>{formatCurrency(currentAmount)}</strong> <span className="muted">of {formatCurrency(targetAmount)}</span>
        </span>
      </div>

      {!compact && (
        <>
          <dl className="sub-details">
            <div>
              <dt>Remaining</dt>
              <dd>{formatCurrency(remainingAmount)}</dd>
            </div>
            <div>
              <dt>Deadline</dt>
              <dd>
                {deadline ? formatDate(deadline) : 'No deadline'}
                {remainingDays !== null && !isCompleted && (
                  <small className={remainingDays < 0 ? 'text-critical' : 'muted'}>
                    {' '}
                    · {remainingDays < 0 ? `${Math.abs(remainingDays)} days overdue` : `${remainingDays} days left`}
                  </small>
                )}
              </dd>
            </div>
          </dl>

          <form className="add-money" onSubmit={handleAdd}>
            <input
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Amount (₹)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              aria-label={`Amount to add to ${name}`}
            />
            <button className="btn btn-sm btn-primary" disabled={adding}>
              <Icon name="plus" size={15} /> {adding ? 'Adding...' : 'Add money'}
            </button>
          </form>
          {error && <small className="text-critical">{error}</small>}

          <div className="card-buttons">
            <button className="btn btn-sm btn-outline" onClick={() => onEdit(goal)}>
              <Icon name="edit" size={15} /> Edit
            </button>
            <button className="btn btn-sm btn-ghost-danger" onClick={() => onDelete(goal)}>
              <Icon name="trash" size={15} /> Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}
