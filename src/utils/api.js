// Central API client for all backend requests
// Base URL reads from Vite env variable, falls back to localhost
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const getToken = () => localStorage.getItem('pj-token');

const request = async (method, path, body) => {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
};

// ── Auth ─────────────────────────────────────────────────────────────
export const apiLogin = (username, password) =>
  request('POST', '/api/auth/login', { username, password });

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
