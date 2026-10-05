import { useState } from 'react';
import Card from '../components/Card';
import Icon from '../components/Icon';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import TransactionTable from '../components/TransactionTable';
import TransactionForm from '../components/TransactionForm';
import useTransactions from '../hooks/useTransactions';
import useFinance from '../hooks/useFinance';
import useFetch from '../hooks/useFetch';
import transactionService from '../services/transactionService';
import { PAYMENT_METHODS } from '../utils/constants';
import { capitalize, daysLabel, formatCurrency, formatDate } from '../utils/format';

export default function Transactions() {
  // useReducer-based custom hook: list, filters, pagination, loading and error
  const {
    transactions,
    pagination,
    totals,
    filters,
    page,
    loading,
    error,
    isSearching,
    setFilter,
    resetFilters,
    setPage,
    reload,
  } = useTransactions(10);

  const { categories, refreshData } = useFinance();
  const recurring = useFetch(() => transactionService.getRecurring(), []);

  // useState for UI state: which form is open and the latest notice
  const [modal, setModal] = useState(null); // { type: 'expense' | 'income', transaction? }
  const [notice, setNotice] = useState(null); // { kind: 'success' | 'warning' | 'exceeded', text }

  const filterCategories = filters.type ? categories.filter((c) => c.type === filters.type) : categories;
  const hasFilters = Object.values(filters).some(Boolean);

  const afterChange = () => {
    reload();
    recurring.refetch();
    refreshData(); // updates budget alerts in the navbar
  };

  const handleSubmit = async (payload) => {
    const result = modal.transaction
      ? await transactionService.update(modal.transaction._id, payload)
      : await transactionService.create(payload);

    const { transaction, autoCategorized, budgetAlert } = result;
    setModal(null);

    if (budgetAlert) {
      setNotice({ kind: budgetAlert.status, text: budgetAlert.message });
    } else {
      const auto = autoCategorized ? ` (auto-categorized as ${transaction.category?.name})` : '';
      setNotice({ kind: 'success', text: `"${transaction.title}" ${modal.transaction ? 'updated' : 'added'}${auto}.` });
    }
    afterChange();
  };

  const handleDelete = async (tx) => {
    if (!window.confirm(`Delete "${tx.title}"?`)) return;
    try {
      await transactionService.remove(tx._id);
      setNotice({ kind: 'success', text: `"${tx.title}" deleted.` });
      afterChange();
    } catch (err) {
      setNotice({ kind: 'exceeded', text: err.message });
    }
  };

  const handleFilter = (e) => setFilter(e.target.name, e.target.type === 'checkbox' ? (e.target.checked ? 'true' : '') : e.target.value);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Transactions</h2>
          <p className="muted">Add, search and filter your income and expenses</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline" onClick={() => setModal({ type: 'income' })}>
            <Icon name="plus" size={16} /> Add income
          </button>
          <button className="btn btn-primary" onClick={() => setModal({ type: 'expense' })}>
            <Icon name="plus" size={16} /> Add expense
          </button>
        </div>
      </div>

      {notice && (
        <div className={`notice notice-${notice.kind}`} role="status">
          <Icon name={notice.kind === 'success' ? 'check' : 'alert'} size={18} />
          <span>{notice.text}</span>
          <button className="icon-btn" onClick={() => setNotice(null)} aria-label="Dismiss">
            <Icon name="close" size={16} />
          </button>
        </div>
      )}

      <Card>
        <div className="filters">
          <div className="search-box">
            <Icon name="search" size={17} />
            <input name="search" value={filters.search} onChange={handleFilter} placeholder="Search title or description..." />
          </div>
          <select name="type" value={filters.type} onChange={(e) => { setFilter('type', e.target.value); setFilter('category', ''); }}>
            <option value="">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select name="category" value={filters.category} onChange={handleFilter}>
            <option value="">All categories</option>
            {filterCategories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} {filters.type ? '' : `(${c.type})`}
              </option>
            ))}
          </select>
          <select name="paymentMethod" value={filters.paymentMethod} onChange={handleFilter}>
            <option value="">All payments</option>
            {PAYMENT_METHODS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <label className="filter-date">
            <span>From</span>
            <input type="date" name="startDate" value={filters.startDate} onChange={handleFilter} />
          </label>
          <label className="filter-date">
            <span>To</span>
            <input type="date" name="endDate" value={filters.endDate} onChange={handleFilter} />
          </label>
          <label className="checkbox">
            <input type="checkbox" name="recurring" checked={filters.recurring === 'true'} onChange={handleFilter} />
            <span>Recurring only</span>
          </label>
          {hasFilters && (
            <button className="btn btn-sm btn-ghost" onClick={resetFilters}>
              Clear filters
            </button>
          )}
        </div>

        <div className="totals-bar">
          <span>
            {pagination.total} transaction{pagination.total === 1 ? '' : 's'}
            {(loading || isSearching) && <span className="spinner small" />}
          </span>
          <span className="amount income">Income {formatCurrency(totals.income)}</span>
          <span className="amount expense">Expense {formatCurrency(totals.expense)}</span>
          <span>Net {formatCurrency(totals.net)}</span>
        </div>

        <ErrorMessage message={error} onRetry={reload} />

        {loading && !transactions.length ? (
          <Loading message="Loading transactions..." />
        ) : transactions.length ? (
          <TransactionTable
            transactions={transactions}
            onEdit={(tx) => setModal({ type: tx.type, transaction: tx })}
            onDelete={handleDelete}
          />
        ) : (
          !error && (
            <EmptyState
              icon="transactions"
              title={hasFilters ? 'No matching transactions' : 'No transactions yet'}
              message={hasFilters ? 'Try changing or clearing the filters.' : 'Click "Add expense" to record your first transaction.'}
            />
          )
        )}

        {pagination.pages > 1 && (
          <div className="pagination">
            <button className="btn btn-sm btn-outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              Previous
            </button>
            <span>
              Page {pagination.page} of {pagination.pages}
            </span>
            <button className="btn btn-sm btn-outline" disabled={page >= pagination.pages} onClick={() => setPage(page + 1)}>
              Next
            </button>
          </div>
        )}
      </Card>

      <Card
        title="Upcoming Recurring Expenses"
        subtitle={recurring.data ? `Estimated ${formatCurrency(recurring.data.monthlyEstimate)} per month (active expenses)` : undefined}
      >
        {recurring.loading && !recurring.data ? (
          <Loading />
        ) : recurring.error ? (
          <ErrorMessage message={recurring.error} onRetry={recurring.refetch} />
        ) : recurring.data.recurring.length ? (
          <ul className="list">
            {recurring.data.recurring.map((item) => (
              <li key={item._id} className="list-item">
                <span className="list-icon">
                  <Icon name="repeat" size={16} />
                </span>
                <div className="list-main">
                  <strong>{item.title}</strong>
                  <small className="muted">
                    {capitalize(item.recurrence.frequency)} · {item.category?.name} · next {formatDate(item.recurrence.nextOccurrence)}
                    {item.recurrence.status === 'active' && ` (${daysLabel(item.daysUntilNext)})`}
                  </small>
                </div>
                <div className="list-side">
                  <strong className={`amount ${item.type}`}>{formatCurrency(item.amount)}</strong>
                  <StatusBadge status={item.recurrence.status} />
                </div>
                <button className="icon-btn" onClick={() => setModal({ type: item.type, transaction: item })} aria-label={`Edit ${item.title}`}>
                  <Icon name="edit" size={17} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon="repeat" title="No recurring expenses" message='Tick "Recurring" when adding rent, internet, gym or loan payments.' />
        )}
      </Card>

      {modal && (
        <Modal title={modal.transaction ? 'Edit transaction' : `Add ${modal.type}`} onClose={() => setModal(null)}>
          <TransactionForm
            transaction={modal.transaction}
            defaultType={modal.type}
            onSubmit={handleSubmit}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}
    </div>
  );
}
