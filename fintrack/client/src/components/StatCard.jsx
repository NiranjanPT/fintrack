import Icon from './Icon';

// Summary tile: Total Income, Total Expenses, Balance, Savings...
export default function StatCard({ label, value, icon, tone = 'blue', hint }) {
  return (
    <div className="stat-card">
      <span className={`stat-icon tone-${tone}`}>
        <Icon name={icon} size={20} />
      </span>
      <div className="stat-body">
        <span className="stat-label">{label}</span>
        <strong className="stat-value">{value}</strong>
        {hint && <span className="stat-hint">{hint}</span>}
      </div>
    </div>
  );
}
