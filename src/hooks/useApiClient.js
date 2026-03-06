import { useCallback } from 'react';

// Example: get token and tenantId from localStorage or context
function getAuthToken() {
  return localStorage.getItem('jwtToken');
}
function getTenantId() {
  return localStorage.getItem('tenantId');
}

export function useApiClient() {
  const apiRequest = useCallback(
    async (endpoint, { method = 'GET', body, headers = {}, ...options } = {}) => {
      const token = getAuthToken();
      const tenantId = getTenantId();
      const apiHeaders = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(tenantId ? { 'x-tenant-id': tenantId } : {}),
        ...headers,
      };
      const response = await fetch(endpoint, {
        method,
        headers: apiHeaders,
        ...(body ? { body: JSON.stringify(body) } : {}),
        ...options,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'API error');
      return data;
    },
    []
  );

  return apiRequest;
}
