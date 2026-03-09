import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout.jsx';

const API_BASE = import.meta.env.VITE_API_URL || '';

function authHeaders() {
  const token = localStorage.getItem('accessToken');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

function StatusBadge({ status }) {
  const active = status === 'Active';
  return (
    <span style={{
      background: active ? 'rgba(34,197,94,0.15)' : 'rgba(143,160,192,0.15)',
      color: active ? 'var(--success)' : 'var(--text-secondary)',
      borderRadius: '4px',
      padding: '0.2rem 0.6rem',
      fontSize: '0.75rem',
      fontWeight: 600,
    }}>
      {status || 'Unknown'}
    </span>
  );
}

export default function Carriers() {
  const [carriers, setCarriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/api/carriers`, { headers: authHeaders() })
      .then((res) => {
        if (res.status === 401) {
          localStorage.removeItem('accessToken');
          window.location.href = '/login';
          return null;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        const list = Array.isArray(data) ? data : (data.carriers || []);
        setCarriers(list);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const filtered = carriers.filter((c) => {
    const q = search.toLowerCase();
    return (
      !q ||
      (c.name || '').toLowerCase().includes(q) ||
      (c.mcNumber || '').toLowerCase().includes(q) ||
      (c.dotNumber || '').toLowerCase().includes(q)
    );
  });

  return (
    <Layout>
      <div style={{ padding: '2rem', fontFamily: 'var(--font-family)' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            Carriers
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Manage your carrier accounts
          </p>
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search carriers…"
            style={{
              padding: '0.6rem 0.9rem',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              width: '280px',
              outline: 'none',
            }}
          />
        </div>

        {loading && <p style={{ color: 'var(--text-secondary)' }}>Loading carriers…</p>}
        {error && <p style={{ color: 'var(--danger)' }}>Error: {error}</p>}

        {!loading && !error && (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            overflow: 'hidden',
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-alt)', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Name</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>MC #</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>DOT #</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Email</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Payment Terms</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Total Spend</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Invoices</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No carriers found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((c, idx) => (
                      <tr key={c.id || idx} style={{ borderTop: '1px solid var(--border)' }}>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>{c.name || '—'}</td>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>{c.mcNumber || '—'}</td>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>{c.dotNumber || '—'}</td>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>{c.email || '—'}</td>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>{c.paymentTerms || '—'}</td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                          ${Number(c.totalSpend || 0).toLocaleString()}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>{c.invoiceCount ?? '—'}</td>
                        <td style={{ padding: '0.75rem 1rem' }}><StatusBadge status={c.status} /></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {filtered.length > 0 && (
              <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                {filtered.length} carrier{filtered.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
