import { useState } from 'react';
import Icon from '../components/Icon';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import StatCard from '../components/StatCard';
import BudgetCard from '../components/BudgetCard';
import BudgetForm from '../components/BudgetForm';
import useFinance from '../hooks/useFinance';
import useFetch from '../hooks/useFetch';
import budgetService from '../services/budgetService';
import { MONTHS, formatCurrency, formatPercent } from '../utils/format';

export default function Budgets() {
  const { selectedMonth, selectedYear, refreshKey, refreshData } = useFinance();
  const { data, loading, error, refetch } = useFetch(
    () => budgetService.getAll(selectedMonth, selectedYear),
    [selectedMonth, selectedYear, refreshKey]
  );

  const [editing, setEditing] = useState(null); // null = closed, {} = new, budget = edit
  const [actionError, setActionError] = useState('');

  const handleSubmit = async (payload) => {
    if (editing?._id) await budgetService.update(editing._id, payload);
    else await budgetService.create(payload);
    setEditing(null);
    refreshData(); // reloads this page (refreshKey) and the navbar alerts
  };

  const handleDelete = async (budget) => {
    if (!window.confirm(`Delete the ${budget.category?.name} budget for ${budget.period}?`)) return;
    try {
      setActionError('');
      await budgetService.remove(budget._id);
      refreshData();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const periodLabel = `${MONTHS[selectedMonth - 1]} ${selectedYear}`;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Budgets</h2>
          <p className="muted">Monthly category budgets for {periodLabel}. Alerts at the warning threshold and at 100%.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setEditing({})}>
          <Icon name="plus" size={16} /> Create budget
        </button>
      </div>

      <ErrorMessage message={actionError} />

      {loading && !data ? (
        <Loading message="Loading budgets..." />
      ) : error && !data ? (
        <ErrorMessage message={error} onRetry={refetch} />
      ) : (
        <>
          <div className="stats-grid">
            <StatCard label="Total Budget" value={formatCurrency(data.summary.totalLimit)} icon="budget" tone="blue" />
            <StatCard label="Total Spent" value={formatCurrency(data.summary.totalSpent)} icon="arrowUp" tone="orange" hint={`${formatPercent(data.summary.percentage)} used`} />
            <StatCard label="Remaining" value={formatCurrency(data.summary.totalRemaining)} icon="wallet" tone="green" />
            <StatCard
              label="Alerts"
              value={data.summary.warningCount + data.summary.exceededCount}
              icon="bell"
              tone={data.summary.exceededCount ? 'red' : 'yellow'}
              hint={`${data.summary.exceededCount} exceeded · ${data.summary.warningCount} warning`}
            />
          </div>

          {data.budgets.length ? (
            <div className="cards-grid">
              {data.budgets.map((budget) => (
                <BudgetCard key={budget._id} budget={budget} onEdit={setEditing} onDelete={handleDelete} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="budget"
              title={`No budgets for ${periodLabel}`}
              message="Create a budget, e.g. Food ₹5000, Transport ₹3000."
              action={
                <button className="btn btn-primary" onClick={() => setEditing({})}>
                  Create budget
                </button>
              }
            />
          )}
        </>
      )}

      {editing && (
        <Modal title={editing._id ? 'Edit budget' : 'Create budget'} onClose={() => setEditing(null)}>
          <BudgetForm budget={editing._id ? editing : null} onSubmit={handleSubmit} onCancel={() => setEditing(null)} />
        </Modal>
      )}
    </div>
  );
}
