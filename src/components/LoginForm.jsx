import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext.js';
import { useNavigate, Link } from 'react-router-dom';

const rawApiBase = import.meta.env.VITE_API_URL;
const API_BASE = rawApiBase ? rawApiBase.trim().replace(/\/+$/, '') : '';


export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        login(data.token);
        navigate('/dashboard');
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-main)',
      fontFamily: 'var(--font-family)',
    }}>
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '2.5rem',
        width: '100%',
        maxWidth: '420px',
      }}>
        <h1 style={{
          color: 'var(--text-primary)',
          fontSize: '1.75rem',
          fontWeight: 700,
          marginBottom: '0.5rem',
        }}>
          Sign In
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.75rem', fontSize: '0.95rem' }}>
          Welcome back to FBPA Fleet
        </p>

        {error && (
          <div style={{
            backgroundColor: 'rgba(239,68,68,0.12)',
            border: '1px solid var(--danger)',
            color: 'var(--danger)',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            marginBottom: '1.25rem',
            fontSize: '0.9rem',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{
              display: 'block',
              color: 'var(--text-secondary)',
              fontSize: '0.875rem',
              fontWeight: 500,
              marginBottom: '0.4rem',
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              style={{
                width: '100%',
                padding: '0.65rem 0.9rem',
                backgroundColor: 'var(--bg-main)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '1rem',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: '1.75rem' }}>
            <label style={{
              display: 'block',
              color: 'var(--text-secondary)',
              fontSize: '0.875rem',
              fontWeight: 500,
              marginBottom: '0.4rem',
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '0.65rem 0.9rem',
                backgroundColor: 'var(--bg-main)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '1rem',
                outline: 'none',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: loading ? 'var(--border)' : 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
            }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          marginTop: '1.5rem',
          color: 'var(--text-secondary)',
          fontSize: '0.9rem',
        }}>
          Don&apos;t have an account?{' '}
          <Link to="/register" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
