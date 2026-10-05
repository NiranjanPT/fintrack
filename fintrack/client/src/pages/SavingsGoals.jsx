import { useState } from 'react';
import Icon from '../components/Icon';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import StatCard from '../components/StatCard';
import SavingsGoalCard from '../components/SavingsGoalCard';
import SavingsGoalForm from '../components/SavingsGoalForm';
import useFetch from '../hooks/useFetch';
import savingsGoalService from '../services/savingsGoalService';
import { formatCurrency } from '../utils/format';

export default function SavingsGoals() {
  const { data, loading, error, refetch, setData } = useFetch(() => savingsGoalService.getAll(), []);
  const [editing, setEditing] = useState(null);
  const [actionError, setActionError] = useState('');

  const handleSubmit = async (payload) => {
    if (editing?._id) await savingsGoalService.update(editing._id, payload);
    else await savingsGoalService.create(payload);
    setEditing(null);
    refetch();
  };

  const handleAddMoney = async (goal, amount) => {
    const updated = await savingsGoalService.addMoney(goal._id, amount);
    // Update the goal in local state immediately, then refresh the summary from the server
    setData((prev) => ({ ...prev, goals: prev.goals.map((g) => (g._id === updated._id ? updated : g)) }));
    refetch();
  };

  const handleDelete = async (goal) => {
    if (!window.confirm(`Delete savings goal "${goal.name}"?`)) return;
    try {
      setActionError('');
      await savingsGoalService.remove(goal._id);
      refetch();
    } catch (err) {
      setActionError(err.message);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Savings Goals</h2>
          <p className="muted">Set targets and track your progress</p>
        </div>
        <button className="btn btn-primary" onClick={() => setEditing({})}>
          <Icon name="plus" size={16} /> New goal
        </button>
      </div>

      <ErrorMessage message={actionError} />

      {loading && !data ? (
        <Loading message="Loading savings goals..." />
      ) : error && !data ? (
        <ErrorMessage message={error} onRetry={refetch} />
      ) : (
        <>
          <div className="stats-grid">
            <StatCard label="Total Saved" value={formatCurrency(data.summary.totalSaved)} icon="piggy" tone="violet" />
            <StatCard label="Total Target" value={formatCurrency(data.summary.totalTarget)} icon="savings" tone="blue" />
            <StatCard label="Overall Progress" value={`${data.summary.overallProgress}%`} icon="analytics" tone="green" />
            <StatCard label="Completed" value={`${data.summary.completedCount} of ${data.summary.count}`} icon="check" tone="green" />
          </div>

          {data.goals.length ? (
            <div className="cards-grid">
              {data.goals.map((goal) => (
                <SavingsGoalCard key={goal._id} goal={goal} onEdit={setEditing} onDelete={handleDelete} onAddMoney={handleAddMoney} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="savings"
              title="No savings goals yet"
              message="Create a goal like an emergency fund or a new laptop."
              action={
                <button className="btn btn-primary" onClick={() => setEditing({})}>
                  New goal
                </button>
              }
            />
          )}
        </>
      )}

      {editing && (
        <Modal title={editing._id ? 'Edit savings goal' : 'New savings goal'} onClose={() => setEditing(null)}>
          <SavingsGoalForm goal={editing._id ? editing : null} onSubmit={handleSubmit} onCancel={() => setEditing(null)} />
        </Modal>
      )}
    </div>
  );
}
