import Icon from './Icon';

export default function EmptyState({ icon = 'info', title, message, action }) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Icon name={icon} size={24} />
      </span>
      <strong>{title}</strong>
      {message && <p>{message}</p>}
      {action}
    </div>
  );
}
