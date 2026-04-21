// Central API client for all backend requests
// In production (Vercel): empty string → relative URLs on same domain
// In local dev: set VITE_API_URL=http://localhost:4000 in .env.local
const BASE = import.meta.env.VITE_API_URL ?? '';

const getToken = () => { try { return localStorage.getItem('pj-token'); } catch { return null; } };

const request = async (method, path, body) => {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch (networkErr) {
    // No internet / CORS / server totally down
    throw new Error('Network error – check your internet connection');
  }

  // Safely parse JSON — Vercel sometimes returns HTML on 500
  let data;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    const text = await res.text();
    if (!res.ok) {
      throw new Error(`Server error (${res.status}): ${text.slice(0, 120)}`);
    }
    data = {};
  }

  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
};

// ── Auth ──────────────────────────────────────────────────────────────
export const apiLogin = (email, password) =>
  request('POST', '/api/auth/login', { email, password });

export const apiChangePassword = (currentPassword, newPassword) =>
  request('POST', '/api/auth/change-password', { currentPassword, newPassword });

// ── Customers ─────────────────────────────────────────────────────────
export const apiFetchCustomers = () => request('GET', '/api/customers');
export const apiAddCustomer    = (data) => request('POST', '/api/customers', data);
export const apiUpdateCustomer = (id, data) => request('PUT', `/api/customers/${id}`, data);
export const apiDeleteCustomer = (id) => request('DELETE', `/api/customers/${id}`);

// ── Loans ─────────────────────────────────────────────────────────────
export const apiFetchLoans = () => request('GET', '/api/loans');
export const apiAddLoan    = (data) => request('POST', '/api/loans', data);
export const apiDeleteLoan = (id) => request('DELETE', `/api/loans/${id}`);

// ── Collections ───────────────────────────────────────────────────────
export const apiFetchCollections = (date) =>
  request('GET', `/api/collections${date ? `?date=${date}` : ''}`);

export const apiGenerateCollections = (date) =>
  request('POST', `/api/collections/generate${date ? `?date=${date}` : ''}`);

export const apiMarkPaid = (id, amount) =>
  request('PATCH', `/api/collections/${id}/pay`, { amount });

export const apiMarkUnpaid = (id) =>
  request('PATCH', `/api/collections/${id}/unpay`);

export const apiFetchLoanCollections = (loanId) =>
  request('GET', `/api/collections/loan/${loanId}`);

// ── Settings ──────────────────────────────────────────────────────────
export const apiFetchSettings = () => request('GET', '/api/settings');
export const apiSaveSettings  = (data) => request('PUT', '/api/settings', data);
