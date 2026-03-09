import React from 'react';
import { useNavigate } from 'react-router-dom';
import FleetDashboard from '../components/FleetDashboard.jsx';

export default function Dashboard() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem('accessToken');
    navigate('/login');
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)', fontFamily: 'var(--font-family)' }}>
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        height: '56px',
        backgroundColor: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
      }}>
        <span style={{
          color: 'var(--text-primary)',
          fontWeight: 700,
          fontSize: '1.1rem',
          letterSpacing: '0.02em',
        }}>
          FBPA Fleet
        </span>
        <button
          onClick={handleLogout}
          style={{
            padding: '0.4rem 1rem',
            backgroundColor: 'transparent',
            color: 'var(--accent)',
            border: '1px solid var(--accent)',
            borderRadius: '6px',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Log Out
        </button>
      </header>
      <main>
        <FleetDashboard />
      </main>
    </div>
  );
}
