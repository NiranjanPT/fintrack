import Icon from './Icon';
import { capitalize, formatCurrency, formatDate } from '../utils/format';
import { PAYMENT_METHODS } from '../utils/constants';

const paymentLabel = (value) => PAYMENT_METHODS.find((m) => m.value === value)?.label || capitalize(value);

// Table of transactions. `compact` hides the payment and action columns (used on the dashboard).
export default function TransactionTable({ transactions, onEdit, onDelete, compact = false }) {
  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Title</th>
            <th>Category</th>
            {!compact && <th>Payment</th>}
            <th className="text-right">Amount</th>
            {!compact && <th className="text-right">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx._id}>
              <td className="nowrap muted">{formatDate(tx.date)}</td>
              <td>
                <div className="tx-title">
                  <span>{tx.title}</span>
                  {tx.isRecurring && (
                    <span className={`chip chip-recurring ${tx.recurrence?.status === 'paused' ? 'paused' : ''}`} title="Recurring">
                      <Icon name="repeat" size={12} />
                      {capitalize(tx.recurrence?.frequency || '')}
                    </span>
                  )}
                </div>
                {!compact && tx.description && <small className="muted tx-desc">{tx.description}</small>}
              </td>
              <td>
                <span className="chip">{tx.category?.name || 'Uncategorized'}</span>
              </td>
              {!compact && <td className="nowrap muted">{paymentLabel(tx.paymentMethod)}</td>}
              <td className={`text-right nowrap amount ${tx.type}`}>
                {tx.type === 'income' ? '+' : '-'}
                {formatCurrency(tx.amount)}
              </td>
              {!compact && (
                <td className="text-right nowrap">
                  <button className="icon-btn" onClick={() => onEdit(tx)} aria-label={`Edit ${tx.title}`}>
                    <Icon name="edit" size={17} />
                  </button>
                  <button className="icon-btn danger" onClick={() => onDelete(tx)} aria-label={`Delete ${tx.title}`}>
                    <Icon name="trash" size={17} />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
