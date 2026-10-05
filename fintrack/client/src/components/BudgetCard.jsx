import Icon from './Icon';
import ProgressBar from './ProgressBar';
import StatusBadge from './StatusBadge';
import { formatCurrency, formatPercent } from '../utils/format';

export default function BudgetCard({ budget, onEdit, onDelete, compact = false }) {
  const { category, limit, spent, remaining, overspent, percentage, status, alertThreshold, period } = budget;

  return (
    <div className={`budget-card ${compact ? 'compact' : ''}`}>
      <div className="budget-card-top">
        <div>
          <strong className="budget-name">{category?.name || 'Category'}</strong>
          {!compact && <small className="muted">{period}</small>}
        </div>
        <StatusBadge status={status} />
      </div>

      <ProgressBar value={percentage} status={status} label={`${category?.name} budget used`} />

      <div className="budget-figures">
        <span>
          <strong>{formatCurrency(spent)}</strong> <span className="muted">of {formatCurrency(limit)}</span>
        </span>
        <span className="budget-percent">{formatPercent(percentage)}</span>
      </div>

      {!compact && (
        <>
          <div className="budget-meta">
            {overspent > 0 ? (
              <span className="text-critical">Over by {formatCurrency(overspent)}</span>
            ) : (
              <span>Remaining: {formatCurrency(remaining)}</span>
            )}
            <span className="muted">Alert at {alertThreshold}%</span>
          </div>
          <div className="card-buttons">
            <button className="btn btn-sm btn-outline" onClick={() => onEdit(budget)}>
              <Icon name="edit" size={15} /> Edit
            </button>
            <button className="btn btn-sm btn-ghost-danger" onClick={() => onDelete(budget)}>
              <Icon name="trash" size={15} /> Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}
