import Icon from './Icon';

// Status is always shown with an icon + text, never color alone
const STATUS = {
  ok: { label: 'On track', icon: 'check' },
  warning: { label: 'Warning', icon: 'info' },
  exceeded: { label: 'Exceeded', icon: 'alert' },
  active: { label: 'Active', icon: 'check' },
  paused: { label: 'Paused', icon: 'info' },
  cancelled: { label: 'Cancelled', icon: 'close' },
  completed: { label: 'Completed', icon: 'check' },
};

export default function StatusBadge({ status }) {
  const config = STATUS[status] || { label: status, icon: 'info' };
  return (
    <span className={`status-badge status-${status}`}>
      <Icon name={config.icon} size={13} strokeWidth={2.5} />
      {config.label}
    </span>
  );
}
