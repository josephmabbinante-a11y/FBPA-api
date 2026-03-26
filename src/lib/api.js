// When the frontend and backend are deployed on the same Railway service (monorepo),
// leave VITE_API_URL unset so all /api/* calls use relative paths on the same origin.
// Only set VITE_API_URL if the frontend is hosted separately from the backend.
const rawApiBase = (import.meta.env.VITE_API_URL || '').trim();
const strippedApiBase = rawApiBase.replace(/\/+$/, '');
// Auto-add https:// if a host was provided without a protocol to prevent silent network errors.
export const API_BASE =
  strippedApiBase && !strippedApiBase.startsWith('http://') && !strippedApiBase.startsWith('https://')
    ? `https://${strippedApiBase}`
    : strippedApiBase;

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
