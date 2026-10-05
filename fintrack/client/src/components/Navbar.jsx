import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from './Icon';
import PeriodSelector from './PeriodSelector';
import useAuth from '../hooks/useAuth';
import useFinance from '../hooks/useFinance';
import { NAV_ITEMS } from '../utils/constants';

export default function Navbar({ onMenuClick }) {
  const { user } = useAuth();
  const { selectedMonth, selectedYear, setMonth, setYear, budgetAlerts } = useFinance();
  const [alertsOpen, setAlertsOpen] = useState(false);
  const alertsRef = useRef(null);
  const location = useLocation();

  const current = NAV_ITEMS.find((item) =>
    item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)
  );

  // Close the alerts dropdown when clicking outside of it
  useEffect(() => {
    const handleClick = (event) => {
      if (alertsRef.current && !alertsRef.current.contains(event.target)) setAlertsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="navbar">
      <button className="icon-btn menu-btn" onClick={onMenuClick} aria-label="Open menu">
        <Icon name="menu" />
      </button>

      <h1 className="navbar-title">{current?.label || 'FinTrack'}</h1>

      <div className="navbar-actions">
        <PeriodSelector
          compact
          month={selectedMonth}
          year={selectedYear}
          onMonthChange={setMonth}
          onYearChange={setYear}
        />

        <div className="alerts" ref={alertsRef}>
          <button
            className="icon-btn"
            onClick={() => setAlertsOpen((open) => !open)}
            aria-label={`Budget alerts (${budgetAlerts.length})`}
          >
            <Icon name="bell" />
            {budgetAlerts.length > 0 && <span className="badge-count">{budgetAlerts.length}</span>}
          </button>

          {alertsOpen && (
            <div className="alerts-dropdown">
              <div className="alerts-header">Budget alerts</div>
              {budgetAlerts.length === 0 ? (
                <p className="alerts-empty">
                  <Icon name="check" size={16} /> All budgets are within limits
                </p>
              ) : (
                budgetAlerts.map((alert) => (
                  <div key={alert.budgetId} className={`alert-item ${alert.status}`}>
                    <Icon name={alert.status === 'exceeded' ? 'alert' : 'info'} size={16} />
                    <div>
                      <strong>{alert.status === 'exceeded' ? 'Exceeded' : 'Warning'}</strong>
                      <p>{alert.message}</p>
                    </div>
                  </div>
                ))
              )}
              <Link to="/budgets" className="alerts-link" onClick={() => setAlertsOpen(false)}>
                View budgets
              </Link>
            </div>
          )}
        </div>

        <span className="avatar navbar-avatar" title={user?.name}>
          {user?.name?.charAt(0).toUpperCase()}
        </span>
      </div>
    </header>
  );
}
