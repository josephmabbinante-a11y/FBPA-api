import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout.jsx';
import { API_BASE, authHeaders, handle401 } from '../lib/api.js';

function StatusBadge({ status }) {
  const colors = {
    Paid: { bg: 'rgba(34,197,94,0.15)', color: 'var(--success)' },
    Pending: { bg: 'rgba(245,158,11,0.15)', color: 'var(--warning)' },
    Overdue: { bg: 'rgba(239,68,68,0.15)', color: 'var(--danger)' },
  };
  const style = colors[status] || { bg: 'rgba(143,160,192,0.15)', color: 'var(--text-secondary)' };
  return (
    <span style={{
      background: style.bg,
      color: style.color,
      borderRadius: '4px',
      padding: '0.2rem 0.6rem',
      fontSize: '0.75rem',
      fontWeight: 600,
    }}>
      {status || 'Unknown'}
    </span>
  );
}

function TypeBadge({ type }) {
  return (
    <span style={{
      background: type === 'AP' ? 'rgba(59,130,246,0.15)' : 'rgba(168,85,247,0.15)',
      color: type === 'AP' ? 'var(--accent)' : '#a855f7',
      borderRadius: '4px',
      padding: '0.2rem 0.5rem',
      fontSize: '0.75rem',
      fontWeight: 600,
    }}>
      {type}
    </span>
  );
}

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/api/invoices`, { headers: authHeaders() })
      .then((res) => {
        if (handle401(res)) return null;
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        const list = Array.isArray(data) ? data : (data.invoices || []);
        setInvoices(list);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const filtered = invoices.filter((inv) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      (inv.invoiceNumber || '').toLowerCase().includes(q) ||
      (inv.carrierName || inv.carrier || '').toLowerCase().includes(q) ||
      (inv.customerName || '').toLowerCase().includes(q);
    const matchType = !typeFilter || inv.type === typeFilter;
    const matchStatus = !statusFilter || inv.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const selectStyle = {
    padding: '0.6rem 0.9rem',
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    outline: 'none',
    cursor: 'pointer',
  };

  return (
    <Layout>
      <div style={{ padding: '2rem', fontFamily: 'var(--font-family)' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            Invoices
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            View and manage freight invoices (AP &amp; AR)
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoices…"
            style={{
              padding: '0.6rem 0.9rem',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              width: '240px',
              outline: 'none',
            }}
          />
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={selectStyle}>
            <option value="">All Types</option>
            <option value="AP">AP</option>
            <option value="AR">AR</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectStyle}>
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>

        {loading && <p style={{ color: 'var(--text-secondary)' }}>Loading invoices…</p>}
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
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Invoice #</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Type</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Carrier</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Customer</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Amount</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Due Date</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No invoices found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((inv, idx) => (
                      <tr key={inv.id || idx} style={{ borderTop: '1px solid var(--border)' }}>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>{inv.invoiceNumber || '—'}</td>
                        <td style={{ padding: '0.75rem 1rem' }}><TypeBadge type={inv.type} /></td>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>
                          {inv.carrierName || inv.carrier || '—'}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>
                          {inv.customerName || '—'}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                          ${Number(inv.amount || 0).toLocaleString()}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>
                          {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '—'}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}><StatusBadge status={inv.status} /></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {filtered.length > 0 && (
              <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                {filtered.length} invoice{filtered.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
