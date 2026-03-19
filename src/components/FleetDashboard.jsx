// --- DAT/AI Rate Comparison Component ---
function DATRateComparison({ params }) {
  // Independent mock logic for DAT/AI rate
  // Different base rates, multipliers, and randomization
  const DAT_BASES = { Van: 2.15, Reefer: 2.55, Flatbed: 2.35 };
  const LANE_MULT = { 'Line Haul': 1.0, Regional: 1.08, Local: 1.15 };
  const base = DAT_BASES[params.equipment] || 2.15;
  const laneMult = LANE_MULT[params.laneType] || 1.0;
  const mileage = Number(params.mileage) || 1;
  // Add some volatility/randomness
  const volatility = 0.95 + Math.random() * 0.12; // 0.95–1.07
  const datRate = (mileage * base * laneMult * volatility + mileage * 0.21).toFixed(2);
  return (
    <div style={{ borderLeft: '2px solid #4f46e5', paddingLeft: 24, marginLeft: 24, minWidth: 180 }}>
      <div style={{ fontWeight: 700, color: '#4f46e5', marginBottom: 4 }}>DAT/AI Market Rate</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: '#4f46e5' }}>${datRate}</div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>(Independent mock: market-based logic)</div>
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { API_BASE, authHeaders, handle401, fetchLiveRate } from '../lib/api.js';

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

  // Live Rate Calculator State
  const [rateParams, setRateParams] = useState({
    origin: '',
    destination: '',
    equipment: 'Van',
    laneType: 'Line Haul',
    mileage: ''
  });
  const [rateResult, setRateResult] = useState(null);
  const [rateLoading, setRateLoading] = useState(false);
  const [rateError, setRateError] = useState(null);
  // Handler for live rate calculation
  const handleRateInput = (e) => {
    const { name, value } = e.target;
    setRateParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleRateSubmit = async (e) => {
    e.preventDefault();
    setRateLoading(true);
    setRateError(null);
    setRateResult(null);
    try {
      const result = await fetchLiveRate({
        ...rateParams,
        mileage: Number(rateParams.mileage)
      });
      setRateResult(result);
    } catch (err) {
      setRateError(err.message);
    } finally {
      setRateLoading(false);
    }
  };

  useEffect(() => {
    fetch(`${API_BASE}/api/dashboard`, { headers: authHeaders() })
      .then((res) => {
        if (handle401(res)) return null;
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
    padding: '2rem',
    fontFamily: 'var(--font-family)',
    background: 'var(--bg)',
    minHeight: '100vh',
  };

  const headingStyle = {
    fontSize: '1.8rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: '0.25rem',
  };

  const subheadingStyle = {
    color: 'var(--text-secondary)',
    fontSize: '0.95rem',
    marginBottom: '2rem',
  };

  const statsRowStyle = {
    display: 'flex',
    gap: '1.5rem',
    flexWrap: 'wrap',
    marginBottom: '2rem',
  };

  const tableContainerStyle = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    overflow: 'hidden',
    marginTop: '2rem',
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
  };

  const theadStyle = {
    background: 'var(--bg-alt)',
    color: 'var(--text-secondary)',
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

      {/* Live Rate Calculator UI */}
      <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Live Truckload Rate Calculator</h2>
        <form onSubmit={handleRateSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
          <div>
            <label>Origin<br />
              <input name="origin" value={rateParams.origin} onChange={handleRateInput} required style={{ width: 120 }} />
            </label>
          </div>
          <div>
            <label>Destination<br />
              <input name="destination" value={rateParams.destination} onChange={handleRateInput} required style={{ width: 120 }} />
            </label>
          </div>
          <div>
            <label>Equipment<br />
              <select name="equipment" value={rateParams.equipment} onChange={handleRateInput}>
                <option value="Van">Van</option>
                <option value="Reefer">Reefer</option>
                <option value="Flatbed">Flatbed</option>
              </select>
            </label>
          </div>
          <div>
            <label>Lane Type<br />
              <select name="laneType" value={rateParams.laneType} onChange={handleRateInput}>
                <option value="Line Haul">Line Haul</option>
                <option value="Regional">Regional</option>
                <option value="Local">Local</option>
              </select>
            </label>
          </div>
          <div>
            <label>Mileage<br />
              <input name="mileage" type="number" min="1" value={rateParams.mileage} onChange={handleRateInput} required style={{ width: 80 }} />
            </label>
          </div>
          <button type="submit" disabled={rateLoading} style={{ padding: '0.5rem 1.2rem', borderRadius: 6, background: 'var(--primary)', color: '#fff', border: 'none', fontWeight: 600 }}>
            {rateLoading ? 'Calculating…' : 'Get Rate'}
          </button>
        </form>
        {rateError && <div style={{ color: 'var(--danger)', marginTop: 8 }}>{rateError}</div>}
        {rateResult && (
          <div style={{ marginTop: 16, background: 'var(--bg-alt)', padding: 12, borderRadius: 8 }}>
            <strong>Your Live Quote:</strong> <span style={{ color: 'var(--primary)' }}>${rateResult.quote}</span> <br />
            <strong>Confidence:</strong> {rateResult.confidence}% <br />
            <strong>Market Position:</strong> {rateResult.marketPosition}
          </div>
        )}
      </div>

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
