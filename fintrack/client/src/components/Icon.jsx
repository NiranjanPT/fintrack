// Small inline SVG icon set (no external icon library needed)
const PATHS = {
  dashboard: 'M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z',
  transactions: 'M7 7h13M7 7l3-3M7 7l3 3M17 17H4m13 0l-3-3m3 3l-3 3',
  budget: 'M12 3a9 9 0 1 0 9 9h-9zM15 3.5A9 9 0 0 1 20.5 9H15z',
  subscriptions: 'M4 5h16v14H4zM4 10h16M8 15h3',
  savings: 'M12 2v4M5 9a7 7 0 1 0 14 0 7 7 0 0 0-14 0zM12 6v6l3 2',
  analytics: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  reports: 'M6 2h9l5 5v15H6zM14 2v6h6M9 13h8M9 17h8',
  logout: 'M15 4h4v16h-4M10 8l-4 4 4 4M6 12h11',
  menu: 'M3 6h18M3 12h18M3 18h18',
  close: 'M6 6l12 12M18 6L6 18',
  bell: 'M18 16v-5a6 6 0 1 0-12 0v5l-2 2h16zM10 21h4',
  plus: 'M12 5v14M5 12h14',
  edit: 'M4 20h4L19 9l-4-4L4 16zM14 6l4 4',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-5-5',
  download: 'M12 4v11M7 10l5 5 5-5M5 20h14',
  repeat: 'M17 2l3 3-3 3M4 11V9a4 4 0 0 1 4-4h12M7 22l-3-3 3-3M20 13v2a4 4 0 0 1-4 4H4',
  wallet: 'M3 7h18v13H3zM3 7l3-4h12l3 4M16 13h2',
  arrowUp: 'M12 19V5M5 12l7-7 7 7',
  arrowDown: 'M12 5v14M19 12l-7 7-7-7',
  piggy: 'M5 11a7 6 0 0 1 14 0v3l-2 2v3h-3v-2h-4v2H7v-3l-2-2zM15 10h.01M2 11h3',
  check: 'M5 12l5 5L20 7',
  alert: 'M12 3l10 18H2zM12 10v5M12 18h.01',
  info: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 11v6M12 7h.01',
  calendar: 'M4 5h16v16H4zM4 10h16M9 3v4M15 3v4',
};

export default function Icon({ name, size = 20, className = '', strokeWidth = 2 }) {
  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={PATHS[name] || PATHS.info} />
    </svg>
  );
}
