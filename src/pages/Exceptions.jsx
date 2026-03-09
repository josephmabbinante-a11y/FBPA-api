import React, { useEffect, useState, useCallback } from 'react';
import Layout from '../components/Layout.jsx';

const API_BASE = import.meta.env.VITE_API_URL || '';

function authHeaders() {
  const token = localStorage.getItem('accessToken');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

const STATUS_COLORS = {
  Open: { bg: 'rgba(245,158,11,0.15)', color: 'var(--warning)' },
  Resolved: { bg: 'rgba(34,197,94,0.15)', color: 'var(--success)' },
  'In Review': { bg: 'rgba(59,130,246,0.15)', color: 'var(--accent)' },
};

const SEVERITY_COLORS = {
  High: { bg: 'rgba(239,68,68,0.15)', color: 'var(--danger)' },
  Medium: { bg: 'rgba(245,158,11,0.15)', color: 'var(--warning)' },
  Low: { bg: 'rgba(34,197,94,0.15)', color: 'var(--success)' },
};

function Badge({ value, colorMap }) {
  const style = colorMap[value] || { bg: 'rgba(143,160,192,0.15)', color: 'var(--text-secondary)' };
  return (
    <span style={{
      background: style.bg,
      color: style.color,
      borderRadius: '4px',
      padding: '0.2rem 0.6rem',
      fontSize: '0.75rem',
      fontWeight: 600,
    }}>
      {value || 'Unknown'}
    </span>
  );
}

export default function Exceptions() {
  const [exceptions, setExceptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [updating, setUpdating] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/exceptions`, { headers: authHeaders() })
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
        const list = Array.isArray(data) ? data : (data.exceptions || []);
        setExceptions(list);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(id, newStatus) {
    setUpdating(id);
    try {
      const res = await fetch(`${API_BASE}/api/exceptions/${id}`, {
        method: 'PATCH',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setExceptions((prev) =>
          prev.map((exc) => (exc.id === id ? { ...exc, status: newStatus } : exc))
        );
      } else {
        setError(`Failed to update status (HTTP ${res.status})`);
      }
    } catch {
      setError('Network error updating exception status');
    } finally {
      setUpdating(null);
    }
  }

  const filtered = exceptions.filter((exc) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      (exc.invoiceNumber || '').toLowerCase().includes(q) ||
      (exc.carrier || '').toLowerCase().includes(q) ||
      (exc.customer || '').toLowerCase().includes(q) ||
      (exc.reason || exc.description || '').toLowerCase().includes(q);
    const matchStatus = !statusFilter || exc.status === statusFilter;
    const matchSeverity = !severityFilter || exc.severity === severityFilter;
    return matchSearch && matchStatus && matchSeverity;
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

  const openCount = exceptions.filter((e) => e.status === 'Open').length;

  return (
    <Layout>
      <div style={{ padding: '2rem', fontFamily: 'var(--font-family)' }}>
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              Exceptions
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Billing discrepancies and audit flags
            </p>
          </div>
          {openCount > 0 && (
            <div style={{
              background: 'rgba(245,158,11,0.15)',
              border: '1px solid var(--warning)',
              color: 'var(--warning)',
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}>
              {openCount} Open Exception{openCount !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exceptions…"
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
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectStyle}>
            <option value="">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Review">In Review</option>
            <option value="Resolved">Resolved</option>
          </select>
          <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} style={selectStyle}>
            <option value="">All Severities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {loading && <p style={{ color: 'var(--text-secondary)' }}>Loading exceptions…</p>}
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
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Carrier</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Customer</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Reason</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Amount</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Severity</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Status</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No exceptions found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((exc, idx) => (
                      <tr key={exc.id || idx} style={{ borderTop: '1px solid var(--border)' }}>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>{exc.invoiceNumber || '—'}</td>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>{exc.carrier || '—'}</td>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>{exc.customer || '—'}</td>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', maxWidth: '220px' }}>
                          <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {exc.reason || exc.description || '—'}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                          ${Number(exc.amount || 0).toLocaleString()}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <Badge value={exc.severity} colorMap={SEVERITY_COLORS} />
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <Badge value={exc.status} colorMap={STATUS_COLORS} />
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          {exc.status !== 'Resolved' && (
                            <button
                              disabled={updating === exc.id}
                              onClick={() => updateStatus(exc.id, exc.status === 'Open' ? 'In Review' : 'Resolved')}
                              style={{
                                padding: '0.3rem 0.7rem',
                                background: 'transparent',
                                border: '1px solid var(--accent)',
                                borderRadius: '5px',
                                color: 'var(--accent)',
                                fontSize: '0.78rem',
                                cursor: updating === exc.id ? 'not-allowed' : 'pointer',
                                opacity: updating === exc.id ? 0.5 : 1,
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {exc.status === 'Open' ? 'Mark In Review' : 'Mark Resolved'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {filtered.length > 0 && (
              <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                {filtered.length} exception{filtered.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
