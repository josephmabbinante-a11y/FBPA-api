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

// Fetch live truckload rate from backend
export async function fetchLiveRate({ origin, destination, equipment = 'Van', laneType = 'Line Haul', mileage }) {
  const res = await fetch(`${API_BASE}/api/rate-logic/calculate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify({ origin, destination, equipment, laneType, mileage }),
  });
  if (handle401(res)) return null;
  if (!res.ok) throw new Error(`Rate API error: ${res.status}`);
  return res.json();
}
