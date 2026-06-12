const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

class ApiError extends Error {
  constructor(public status: number, public body: any) {
    super(body?.detail || body?.message || `API error ${status}`);
  }
}

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('fsos_token');
}

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'x-tenant-id': localStorage.getItem('fsos_tenant_id') || '',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    if (res.status === 401) {
      localStorage.removeItem('fsos_token');
      if (typeof window !== 'undefined') window.location.href = '/login';
    }
    throw new ApiError(res.status, body);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const apiClient = {
  get: <T>(path: string) => api<T>(path),
  post: <T>(path: string, data?: unknown) => api<T>(path, { method: 'POST', body: data ? JSON.stringify(data) : undefined }),
  put: <T>(path: string, data: unknown) => api<T>(path, { method: 'PUT', body: JSON.stringify(data) }),
  patch: <T>(path: string, data: unknown) => api<T>(path, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: <T>(path: string) => api<T>(path, { method: 'DELETE' }),
};

export function setAuth(token: string, tenantId: string, user: any) {
  localStorage.setItem('fsos_token', token);
  localStorage.setItem('fsos_tenant_id', tenantId);
  localStorage.setItem('fsos_user', JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem('fsos_token');
  localStorage.removeItem('fsos_tenant_id');
  localStorage.removeItem('fsos_user');
}

export function getStoredUser() {
  if (typeof window === 'undefined') return null;
  const u = localStorage.getItem('fsos_user');
  return u ? JSON.parse(u) : null;
}
