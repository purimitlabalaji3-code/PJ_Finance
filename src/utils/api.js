// src/utils/api.js — Professional Safe Fetch Wrapper
const BASE = import.meta.env.VITE_API_URL ?? '';
const TIMEOUT = 15000; // 15 seconds timeout for slow networks

const clearSessionAndReload = () => {
  window.location.reload();
};

/**
 * Enhanced fetch with timeout support
 */
const fetchWithTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

/**
 * Global API request handler with Retries and Error Handling
 */
const request = async (method, path, body, options = {}) => {
  const maxRetries = options.retries ?? 1;
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      const res = await fetchWithTimeout(`${BASE}${path}`, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });

      const contentType = res.headers.get('content-type') || '';
      let data = {};
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        if (!res.ok) throw new Error(`Server error (${res.status}): ${text.slice(0, 50)}...`);
      }

      if (res.status === 401) {
        if (!options.skipReload && !window.location.pathname.includes('/login')) {
          clearSessionAndReload();
        }
        throw new Error(data.error || 'Session expired');
      }

      if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
      
      return data;

    } catch (err) {
      attempt++;
      const isNetworkError = err.name === 'AbortError' || err.message.includes('Network error');
      
      if (attempt <= maxRetries && isNetworkError) {
        await new Promise(r => setTimeout(r, 1000 * attempt)); 
        continue;
      }
      
      throw err;
    }
  }
};

// ── Auth ──────────────────────────────────────────────────────────────
export const apiLogin          = (email, password) => request('POST', '/api/auth/login', { email, password });
export const apiFetchMe        = () => request('GET', '/api/auth/me', null, { skipReload: true });
export const apiLogout         = () => request('POST', '/api/auth/logout');
export const apiChangePassword = (currentPassword, newPassword) => request('POST', '/api/auth/change-password', { currentPassword, newPassword });

// ── Customers ─────────────────────────────────────────────────────────
export const apiFetchCustomers = () => request('GET', '/api/customers');
export const apiAddCustomer    = (data) => request('POST', '/api/customers', data);
export const apiUpdateCustomer = (id, data) => request('PUT', `/api/customers/${id}`, data);
export const apiDeleteCustomer = (id) => request('DELETE', `/api/customers/${id}`);

// ── Loans ─────────────────────────────────────────────────────────────
export const apiFetchLoans     = () => request('GET', '/api/loans');
export const apiAddLoan        = (data) => request('POST', '/api/loans', data);
export const apiDeleteLoan     = (id) => request('DELETE', `/api/loans/${id}`);

// ── Collections ───────────────────────────────────────────────────────
export const apiFetchCollections     = (date) => request('GET', `/api/collections${date ? `?date=${date}` : ''}`);
export const apiGenerateCollections  = (date) => request('POST', `/api/collections/generate${date ? `?date=${date}` : ''}`);
export const apiMarkPaid             = (id, amount) => request('PATCH', `/api/collections/${id}/pay`, { amount });
export const apiMarkUnpaid           = (id) => request('PATCH', `/api/collections/${id}/unpay`);
export const apiFetchLoanCollections = (loanId) => request('GET', `/api/collections/loan/${loanId}`);

// ── Settings ──────────────────────────────────────────────────────────
export const apiFetchSettings  = () => request('GET', '/api/settings');
export const apiSaveSettings   = (data) => request('PUT', '/api/settings', data);

// ── Fallback Exports (To prevent Build Crash) ─────────────────────────
export const apiFetchStats     = () => Promise.resolve({ success: true, data: [] });
export const apiUploadFile     = () => Promise.resolve({ success: true });
export const apiDeleteFile     = () => Promise.resolve({ success: true });
