import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/customers', label: 'Customers', icon: '👥' },
  { to: '/carriers', label: 'Carriers', icon: '🚛' },
  { to: '/invoices', label: 'Invoices', icon: '🧾' },
  { to: '/exceptions', label: 'Exceptions', icon: '⚠️' },
];

export default function Layout({ children }) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  function handleLogout() {
    localStorage.removeItem('accessToken');
    navigate('/login');
  }

  const sidebarWidth = collapsed ? '56px' : '200px';

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: 'var(--bg-main)',
      fontFamily: 'var(--font-family)',
    }}>
      {/* Sidebar */}
      <nav style={{
        width: sidebarWidth,
        minWidth: sidebarWidth,
        backgroundColor: 'var(--bg-card)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s',
        overflow: 'hidden',
      }}>
        {/* Brand */}
        <div style={{
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: collapsed ? '0' : '0 1rem',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          {!collapsed && (
            <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1rem', whiteSpace: 'nowrap' }}>
              FBPA Fleet
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '1.1rem',
              padding: '4px',
              lineHeight: 1,
            }}
          >
            {collapsed ? '»' : '«'}
          </button>
        </div>

        {/* Nav links */}
        <div style={{ flex: 1, paddingTop: '0.5rem' }}>
          {NAV_ITEMS.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 1rem',
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'rgba(59,130,246,0.1)' : 'transparent',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: isActive ? 600 : 400,
                borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
                whiteSpace: 'nowrap',
                transition: 'background-color 0.15s, color 0.15s',
              })}
            >
              <span style={{ fontSize: '1rem', flexShrink: 0 }}>{icon}</span>
              {!collapsed && label}
            </NavLink>
          ))}
        </div>

        {/* Logout */}
        <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: collapsed ? '0.5rem' : '0.5rem 0.75rem',
              backgroundColor: 'transparent',
              color: 'var(--danger)',
              border: '1px solid var(--danger)',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}
          >
            {collapsed ? '↩' : 'Log Out'}
          </button>
        </div>
      </nav>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        {children}
      </div>
    </div>
  );
}
