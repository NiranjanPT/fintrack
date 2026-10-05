import Icon from './Icon';

const FEATURES = [
  'Track income and expenses',
  'Automatic expense categories',
  'Budgets with alerts',
  'Subscriptions and savings goals',
  'Monthly analytics and CSV reports',
];

// Two-column layout for the Login and Register pages
export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth-page">
      <div className="auth-hero">
        <div className="auth-brand">
          <span className="brand-logo">
            <Icon name="wallet" size={22} />
          </span>
          <span>FinTrack</span>
        </div>
        <h2>Personal Finance &amp; Expense Analytics</h2>
        <ul>
          {FEATURES.map((feature) => (
            <li key={feature}>
              <Icon name="check" size={16} /> {feature}
            </li>
          ))}
        </ul>
      </div>
      <div className="auth-panel">
        <div className="auth-card">
          <h1>{title}</h1>
          <p className="muted">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
