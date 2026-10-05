import { useState } from 'react';
import Icon from '../components/Icon';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import StatCard from '../components/StatCard';
import SubscriptionCard from '../components/SubscriptionCard';
import SubscriptionForm from '../components/SubscriptionForm';
import useFetch from '../hooks/useFetch';
import subscriptionService from '../services/subscriptionService';
import { formatCurrency } from '../utils/format';

const TABS = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function Subscriptions() {
  const [status, setStatus] = useState('');
  const { data, loading, error, refetch } = useFetch(() => subscriptionService.getAll(status), [status]);

  const [editing, setEditing] = useState(null);
  const [actionError, setActionError] = useState('');

  const handleSubmit = async (payload) => {
    if (editing?._id) await subscriptionService.update(editing._id, payload);
    else await subscriptionService.create(payload);
    setEditing(null);
    refetch();
  };

  const handleDelete = async (sub) => {
    if (!window.confirm(`Delete subscription "${sub.name}"?`)) return;
    try {
      setActionError('');
      await subscriptionService.remove(sub._id);
      refetch();
    } catch (err) {
      setActionError(err.message);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Subscriptions</h2>
          <p className="muted">Netflix, Spotify, cloud storage and other repeating bills</p>
        </div>
        <button className="btn btn-primary" onClick={() => setEditing({})}>
          <Icon name="plus" size={16} /> Add subscription
        </button>
      </div>

      <ErrorMessage message={actionError} />

      {loading && !data ? (
        <Loading message="Loading subscriptions..." />
      ) : error && !data ? (
        <ErrorMessage message={error} onRetry={refetch} />
      ) : (
        <>
          <div className="stats-grid three">
            <StatCard label="Monthly Total" value={formatCurrency(data.summary.monthlyTotal)} icon="calendar" tone="orange" hint="Active subscriptions" />
            <StatCard label="Yearly Total" value={formatCurrency(data.summary.yearlyTotal)} icon="subscriptions" tone="blue" />
            <StatCard label="Active" value={`${data.summary.activeCount} of ${data.summary.totalCount}`} icon="check" tone="green" />
          </div>

          <div className="tabs" role="tablist">
            {TABS.map((tab) => (
              <button
                key={tab.value}
                role="tab"
                aria-selected={status === tab.value}
                className={`tab ${status === tab.value ? 'active' : ''}`}
                onClick={() => setStatus(tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {data.subscriptions.length ? (
            <div className="cards-grid">
              {data.subscriptions.map((sub) => (
                <SubscriptionCard key={sub._id} subscription={sub} onEdit={setEditing} onDelete={handleDelete} />
              ))}
            </div>
          ) : (
            <EmptyState icon="subscriptions" title="No subscriptions found" message="Add services you pay for regularly." />
          )}
        </>
      )}

      {editing && (
        <Modal title={editing._id ? 'Edit subscription' : 'Add subscription'} onClose={() => setEditing(null)}>
          <SubscriptionForm subscription={editing._id ? editing : null} onSubmit={handleSubmit} onCancel={() => setEditing(null)} />
        </Modal>
      )}
    </div>
  );
}
