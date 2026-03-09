const rawApiBase = (import.meta.env.VITE_API_URL || '').trim();
export const API_BASE = rawApiBase.replace(/\/+$/, '');

export function authHeaders() {
  const token = localStorage.getItem('accessToken');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export function handle401(res) {
  if (res.status === 401) {
    localStorage.removeItem('accessToken');
    window.location.href = '/login';
    return true;
  }
  return false;
}
