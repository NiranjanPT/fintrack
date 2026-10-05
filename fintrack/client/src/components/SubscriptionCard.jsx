import Icon from './Icon';
import StatusBadge from './StatusBadge';
import { capitalize, daysLabel, formatCurrency, formatDate } from '../utils/format';

const PER = { weekly: 'week', monthly: 'month', quarterly: 'quarter', yearly: 'year' };

export default function SubscriptionCard({ subscription, onEdit, onDelete }) {
  const { name, amount, billingCycle, nextBillingDate, category, status, monthlyCost, daysUntilBilling } = subscription;

  return (
    <div className={`sub-card ${status !== 'active' ? 'inactive' : ''}`}>
      <div className="sub-card-top">
        <span className="sub-avatar">{name.charAt(0).toUpperCase()}</span>
        <div className="sub-title">
          <strong>{name}</strong>
          <small className="muted">{category?.name}</small>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="sub-amount">
        <strong>{formatCurrency(amount)}</strong>
        <span className="muted"> / {PER[billingCycle]}</span>
      </div>

      <dl className="sub-details">
        <div>
          <dt>Billing cycle</dt>
          <dd>{capitalize(billingCycle)}</dd>
        </div>
        <div>
          <dt>Next billing</dt>
          <dd>
            {formatDate(nextBillingDate)}
            {status === 'active' && <small className="muted"> · {daysLabel(daysUntilBilling)}</small>}
          </dd>
        </div>
        <div>
          <dt>Monthly cost</dt>
          <dd>{formatCurrency(monthlyCost)}</dd>
        </div>
      </dl>

      <div className="card-buttons">
        <button className="btn btn-sm btn-outline" onClick={() => onEdit(subscription)}>
          <Icon name="edit" size={15} /> Edit
        </button>
        <button className="btn btn-sm btn-ghost-danger" onClick={() => onDelete(subscription)}>
          <Icon name="trash" size={15} /> Delete
        </button>
      </div>
    </div>
  );
}
