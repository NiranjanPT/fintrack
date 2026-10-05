// Progress bar used by budgets (status colors) and savings goals
export default function ProgressBar({ value, status = 'ok', label }) {
  const width = Math.min(Math.max(Number(value) || 0, 0), 100);

  return (
    <div
      className="progress"
      role="progressbar"
      aria-valuenow={Math.round(width)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div className={`progress-fill status-${status}`} style={{ width: `${width}%` }} />
    </div>
  );
}
