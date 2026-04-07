const API_BASE = (process.env.REACT_APP_SERVER_URL || 'http://localhost:5000').replace(/\/$/, '');

export function getAdminToken() {
  return localStorage.getItem('va_admin_token') || '';
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
    throw new Error(message);
  }

  return res.json();
}

export async function adminRequest(path, options = {}) {
  const token = getAdminToken();
  return apiRequest(path, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });
}

export function getApiBase() {
  return API_BASE;
}
