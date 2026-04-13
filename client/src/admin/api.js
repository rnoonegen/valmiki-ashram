const API_BASE = (process.env.REACT_APP_SERVER_URL || 'http://localhost:5000').replace(/\/$/, '');

function parseJwtPayload(token = '') {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const normalized = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(atob(normalized));
  } catch (error) {
    return null;
  }
}

function isTokenExpired(token = '') {
  const payload = parseJwtPayload(token);
  if (!payload?.exp) return false;
  return Date.now() >= payload.exp * 1000;
}

function handleAdminUnauthorized() {
  clearAdminToken();
  if (typeof window !== 'undefined') {
    const adminPath = window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/');
    if (adminPath) {
      window.location.replace('/admin-login');
    }
  }
}

export function getAdminToken() {
  const token = localStorage.getItem('va_admin_token') || '';
  if (token && isTokenExpired(token)) {
    clearAdminToken();
    return '';
  }
  return token;
}

export function setAdminToken(token) {
  localStorage.setItem('va_admin_token', token);
}

export function clearAdminToken() {
  localStorage.removeItem('va_admin_token');
}

export async function apiRequest(path, options = {}) {
  const mergedHeaders = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: mergedHeaders,
  });

  if (!res.ok) {
    let message = 'Request failed';
    try {
      const body = await res.json();
      message = body?.message || message;
    } catch (error) {
      // no-op
    }
    const error = new Error(message);
    error.status = res.status;
    throw error;
  }

  return res.json();
}

export async function adminRequest(path, options = {}) {
  const token = getAdminToken();
  try {
    return await apiRequest(path, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    if (error?.status === 401) {
      handleAdminUnauthorized();
    }
    throw error;
  }
}

export function getApiBase() {
  return API_BASE;
}
