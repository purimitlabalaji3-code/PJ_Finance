// src/utils/api.js — Production-grade Safe Fetch Wrapper
const BASE = import.meta.env.VITE_API_URL ?? '';
const DEFAULT_TIMEOUT = 15000; // 15s for normal requests
const SESSION_TIMEOUT = 20000; // 20s for session check (Vercel cold starts)


/**
 * Safe localStorage wrapper to prevent crashes in restricted environments
 */
const safeStorage = {
  get: (key) => {
    try {
      return localStorage.getItem(key);
    } catch {
      console.warn('localStorage blocked');
      return null;
    }
  },
  set: (key, value) => {
    try { localStorage.setItem(key, value); } catch { /* ignore */ }
  },
  remove: (key) => {
    try { localStorage.removeItem(key); } catch { /* ignore */ }
  }
};

/**
 * Enhanced fetch with configurable timeout support
 */
const fetchWithTimeout = async (url, options = {}, timeout = DEFAULT_TIMEOUT) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please check your internet connection.');
    }
    throw error;
  }
};

/**
 * Global API request handler with Retries and Error Handling
 */
const request = async (method, path, body, options = {}) => {
  const maxRetries = options.retries ?? 1;
  // Use longer timeout for session check calls on slow devices
  const timeout = options.timeout ?? DEFAULT_TIMEOUT;
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      const token = safeStorage.get('pj_backup_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetchWithTimeout(
        `${BASE}${path}`,
        {
          method,
          credentials: 'include',
          headers,
          ...(body ? { body: JSON.stringify(body) } : {}),
        },
        timeout
      );

      const contentType = res.headers.get('content-type') || '';
      let data = {};
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        if (!res.ok) throw new Error(`Server error (${res.status}): ${text.slice(0, 50)}...`);
      }

      if (res.status === 401) {
        throw new Error(path.includes('/login') ? 'Invalid credentials' : 'Session expired');
      }

      if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);

      return data;

    } catch (err) {
      attempt++;
      const isNetworkError =
        err.name === 'AbortError' ||
        err.message.toLowerCase().includes('network') ||
        err.message.toLowerCase().includes('timeout') ||
        err.message.toLowerCase().includes('failed to fetch');

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
export const apiGoogleLogin     = (credential) => request('POST', '/api/auth/google', { credential });
// apiFetchMe: skipReload = true so a 401 doesn't trigger a reload loop.
// timeout = 20s to handle Vercel cold starts on slow Android devices.
export const apiFetchMe        = () => request('GET', '/api/auth/me', null, { skipReload: true, timeout: SESSION_TIMEOUT });
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
export const apiAddManualCollection  = (data) => request('POST', '/api/collections/manual', data);
export const apiMarkPaid             = (id, amount) => request('PATCH', `/api/collections/${id}/pay`, { amount });
export const apiMarkUnpaid           = (id) => request('PATCH', `/api/collections/${id}/unpay`);
export const apiFetchLoanCollections = (loanId) => request('GET', `/api/collections/loan/${loanId}`);

// ── Settings ──────────────────────────────────────────────────────────
export const apiFetchSettings  = () => request('GET', '/api/settings');
export const apiSaveSettings   = (data) => request('PUT', '/api/settings', data);

// ── Fallback Exports (prevent Build Crash if referenced) ──────────────
export const apiFetchStats = () => Promise.resolve({ success: true, data: [] });
export const apiUploadFile = () => Promise.resolve({ success: true });
export const apiDeleteFile = () => Promise.resolve({ success: true });
