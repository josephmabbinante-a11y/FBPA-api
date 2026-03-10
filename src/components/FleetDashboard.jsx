import React, { useEffect, useState } from 'react';

const cardStyle = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  padding: '1.5rem',
  flex: '1 1 200px',
};

const statLabelStyle = {
  color: 'var(--text-secondary)',
  fontSize: '0.85rem',
  marginBottom: '0.4rem',
};

const statValueStyle = {
  fontSize: '2rem',
  fontWeight: '700',
  color: 'var(--text-primary)',
};

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function StatCard({ label, value, color }) {
  return (
    <div style={cardStyle}>
      <div style={statLabelStyle}>{label}</div>
      <div style={{ ...statValueStyle, color: color || 'var(--text-primary)' }}>{value}</div>
    </div>
  );
}

function ActivityRow({ item }) {
  const badgeColor = item.status === 'Open' || item.status === 'Pending'
    ? 'var(--warning)'
    : 'var(--success)';

  return (
    <tr style={{ borderBottom: '1px solid var(--border)' }}>
      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
        {item.type}
      </td>
      <td style={{ padding: '0.75rem 1rem' }}>{item.invoiceNumber || item.id || '—'}</td>
      <td style={{ padding: '0.75rem 1rem' }}>{item.carrier || '—'}</td>
      <td style={{ padding: '0.75rem 1rem' }}>
        ${Number(item.amount || 0).toLocaleString()}
      </td>
      <td style={{ padding: '0.75rem 1rem' }}>
        <span style={{
          background: badgeColor,
          color: '#fff',
          borderRadius: '4px',
          padding: '0.2rem 0.6rem',
          fontSize: '0.75rem',
          fontWeight: '600',
        }}>
          {item.status}
        </span>
      </td>
    </tr>
  );
}

export default function FleetDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    fetch(`${API_BASE}/api/dashboard`, { headers })
      .then((res) => {
        if (res.status === 401) {
          localStorage.removeItem('accessToken');
          window.location.href = '/login';
          return null;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
        return res.json();
      })
      .then((json) => {
        if (!json) return;
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const containerStyle = {
    minHeight: '100vh',
    background: 'var(--bg-alt)',
    padding: '2rem',
    fontFamily: 'var(--font-family)',
  };

  const headingStyle = {
    fontSize: '1.8rem',
    fontWeight: '700',
    marginBottom: '0.25rem',
    color: 'var(--text-primary)',
  };

  const subheadingStyle = {
    color: 'var(--text-secondary)',
    marginBottom: '2rem',
    fontSize: '0.95rem',
  };

  const statsRowStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
    marginBottom: '2rem',
  };

  const tableContainerStyle = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    overflow: 'hidden',
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
  };

  const theadStyle = {
    background: 'var(--bg-alt)',
    color: 'var(--text-secondary)',
    textAlign: 'left',
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  if (loading) {
    return (
      <div style={{ ...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading dashboard…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ ...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--danger)' }}>Error loading dashboard: {error}</p>
      </div>
    );
  }

  const { summary, recentActivity } = data || {};

  return (
    <div style={containerStyle}>
      <h1 style={headingStyle}>Fleet Dashboard</h1>
      <p style={subheadingStyle}>Freight Billing &amp; Payment Audit Overview</p>

      <div style={statsRowStyle}>
        <StatCard label="Total Invoices" value={summary?.totalInvoices ?? '—'} />
        <StatCard
          label="Total Exceptions"
          value={summary?.totalExceptions ?? '—'}
          color="var(--warning)"
        />
        <StatCard
          label="Total Savings"
          value={summary?.totalSavings != null ? `$${Number(summary.totalSavings).toLocaleString()}` : '—'}
          color="var(--success)"
        />
        <StatCard
          label="Pending Review"
          value={summary?.pendingReview ?? '—'}
          color="var(--danger)"
        />
      </div>

      {recentActivity && recentActivity.length > 0 && (
        <div style={tableContainerStyle}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: '600' }}>Recent Activity</h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead style={theadStyle}>
                <tr>
                  <th style={{ padding: '0.75rem 1rem' }}>Type</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Invoice #</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Carrier</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Amount</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((item, idx) => (
                  <ActivityRow key={item.id || idx} item={item} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
