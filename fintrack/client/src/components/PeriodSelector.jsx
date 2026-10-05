import { MONTHS } from '../utils/format';
import { getYearOptions } from '../utils/constants';

// Month + year dropdowns. allowAllMonths adds an "All months" option (full-year reports).
export default function PeriodSelector({
  month,
  year,
  onMonthChange,
  onYearChange,
  allowAllMonths = false,
  compact = false,
}) {
  return (
    <div className={`period-selector ${compact ? 'compact' : ''}`}>
      <select value={month} onChange={(e) => onMonthChange(e.target.value)} aria-label="Select month">
        {allowAllMonths && <option value="all">All months</option>}
        {MONTHS.map((name, index) => (
          <option key={name} value={index + 1}>
            {compact ? name.slice(0, 3) : name}
          </option>
        ))}
      </select>
      <select value={year} onChange={(e) => onYearChange(e.target.value)} aria-label="Select year">
        {getYearOptions().map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}
