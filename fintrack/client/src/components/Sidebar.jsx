import { NavLink } from 'react-router-dom';
import Icon from './Icon';
import useAuth from '../hooks/useAuth';
import { NAV_ITEMS } from '../utils/constants';

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <span className="brand-logo">
          <Icon name="wallet" size={20} />
        </span>
        <span className="brand-name">FinTrack</span>
        <button className="icon-btn sidebar-close" onClick={onClose} aria-label="Close menu">
          <Icon name="close" />
        </button>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <Icon name={item.icon} size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <span className="avatar">{user?.name?.charAt(0).toUpperCase()}</span>
          <div className="sidebar-user-info">
            <strong>{user?.name}</strong>
            <small>{user?.email}</small>
          </div>
        </div>
        <button className="nav-link logout-link" onClick={logout}>
          <Icon name="logout" size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
