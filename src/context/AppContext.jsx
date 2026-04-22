import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ── Safe localStorage wrappers (only used for theme now) ────────────────────
const store = {
  get: (key) => { try { return localStorage.getItem(key); } catch { return null; } },
  set: (key, val) => { try { localStorage.setItem(key, val); } catch { /* ignore */ } },
};
import {
  apiLogin, apiFetchMe, apiLogout,
  apiFetchCustomers, apiAddCustomer, apiUpdateCustomer, apiDeleteCustomer,
  apiFetchLoans, apiAddLoan, apiDeleteLoan,
  apiFetchCollections, apiGenerateCollections, apiMarkPaid, apiMarkUnpaid,
} from '@/utils/api';

import toast from 'react-hot-toast';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

// ── Normalizers defined at module scope so they're always available ──────────
const normalLoan = (l) => ({
  id:           l.id,
  customerId:   l.customer_id,
  customerName: l.customer_name,
  loanAmount:   Number(l.loan_amount),
  interest:     Number(l.interest),
  totalAmount:  Number(l.total_amount),
  dailyAmount:  Number(l.daily_amount),
  startDate:    l.start_date ? String(l.start_date).split('T')[0] : '',
  status:       l.status,
  paidDays:     l.paid_days,
  totalDays:    l.total_days,
  totalCollected: Number(l.total_collected || 0),
});

const normalCollection = (c) => ({
  id:           c.id,
  loanId:       c.loan_id,
  customerId:   c.customer_id,
  customerName: c.customer_name,
  phone:        c.phone,
  dueAmount:    Number(c.due_amount),
  paidAmount:   Number(c.paid_amount),
  date:         c.date ? String(c.date).split('T')[0] : '',
  status:       c.status,
});

const normalCustomer = (c) => ({
  id:       c.id,
  name:     c.name,
  phone:    c.phone,
  age:      c.age,
  gender:   c.gender,
  aadhaar:  c.aadhaar,
  address:  c.address,
  status:   c.status,
  image:    c.image,
  joinDate: c.join_date ? String(c.join_date).split('T')[0] : '',
});

export const AppProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => store.get('pj-theme') || 'dark');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

  const [customers, setCustomers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);

  // ── Theme ──────────────────────────────────────────────────────────
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.classList.toggle('light', theme !== 'dark');
    store.set('pj-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  // ── Session Check on Mount (with retry for slow devices) ──────────────────
  useEffect(() => {
    let cancelled = false;

    const checkSession = async () => {
      // Attempt 1
      try {
        await apiFetchMe();
        if (!cancelled) {
          setIsLoggedIn(true);
          setSessionChecked(true); // MUST set this or spinner shows forever
        }
        return;
      } catch {
        // On slow devices (Vivo, Realme) network may not be ready yet.
        // Wait 1.5s and retry ONCE before deciding the user is logged out.
      }

      await new Promise(r => setTimeout(r, 1500));
      if (cancelled) return;

      // Attempt 2 (retry)
      try {
        await apiFetchMe();
        if (!cancelled) setIsLoggedIn(true);
      } catch {
        if (!cancelled) setIsLoggedIn(false);
      } finally {
        if (!cancelled) setSessionChecked(true);
      }
    };

    checkSession();
    return () => { cancelled = true; };
  }, []);

  // ── Auth ───────────────────────────────────────────────────────────
  const login = async (email, password) => {
    const res = await apiLogin(email, password);
    if (res?.token) {
      try {
        localStorage.setItem('pj_backup_token', res.token);
      } catch (e) {
        console.warn('localStorage write failed:', e.message);
      }
    }

    // 🔥 VERIFY SESSION BEFORE PROCEEDING
    // This ensures cookie is committed and readable by the server
    // before we let the app navigate to protected routes.
    await apiFetchMe();

    setIsLoggedIn(true);
  };

  const logout = async () => {
    try { await apiLogout(); } catch { /* ignore */ }
    localStorage.removeItem('pj_backup_token');
    setIsLoggedIn(false);
  };

  // ── Data Loading ───────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    if (!isLoggedIn) return;
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const [c, l, col] = await Promise.all([
        apiFetchCustomers(),
        apiFetchLoans(),
        apiFetchCollections(today),
      ]);
      setCustomers(Array.isArray(c) ? c.map(normalCustomer) : []);
      setLoans(Array.isArray(l) ? l.map(normalLoan) : []);
      setCollections(Array.isArray(col) ? col.map(normalCollection) : []);
    } catch (err) {
      console.error('Load error:', err);
      // If the token is missing or expired, the api.js 401 handler will auto-reload.
      // For all other errors show a toast.
      if (!err.message?.includes('Session expired') && !err.message?.includes('No token')) {
        toast.error('Failed to load data. Check your connection.');
      }
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Customer CRUD ──────────────────────────────────────────────────
  const addCustomer = async (customer) => {
    const row = await apiAddCustomer(customer);
    const nc = normalCustomer(row);
    setCustomers(prev => [nc, ...prev]);
    return nc;
  };

  const updateCustomer = async (id, data) => {
    const row = await apiUpdateCustomer(id, data);
    const nc = normalCustomer(row);
    setCustomers(prev => prev.map(c => c.id === id ? nc : c));
  };

  const deleteCustomer = async (id) => {
    await apiDeleteCustomer(id);
    setCustomers(prev => prev.filter(c => c.id !== id));
  };

  // ── Loan CRUD ──────────────────────────────────────────────────────
  const addLoan = async (loan) => {
    const row = await apiAddLoan(loan);
    const nl = normalLoan(row);
    setLoans(prev => [nl, ...prev]);
    return nl;
  };

  const deleteLoan = async (id) => {
    await apiDeleteLoan(id);
    setLoans(prev => prev.filter(l => l.id !== id));
  };

  // ── Collections ────────────────────────────────────────────────────
  const generateCollections = async (date) => {
    const result = await apiGenerateCollections(date);
    await loadAll();
    return result;
  };

  const markCollectionPaid = async (id, amount) => {
    const row = await apiMarkPaid(id, amount);
    const nc = normalCollection(row);
    setCollections(prev => prev.map(c => c.id === id ? nc : c));
    setLoans(prev => prev.map(l =>
      l.id === nc.loanId ? { ...l, paidDays: l.paidDays + 1 } : l
    ));
  };

  const markCollectionPending = async (id) => {
    const row = await apiMarkUnpaid(id);
    const nc = normalCollection(row);
    setCollections(prev => prev.map(c => c.id === id ? nc : c));
    setLoans(prev => prev.map(l =>
      l.id === nc.loanId ? { ...l, paidDays: Math.max(l.paidDays - 1, 0) } : l
    ));
  };

  // ── Stats ──────────────────────────────────────────────────────────
  const stats = {
    totalCustomers:  customers.length,
    activeLoans:     loans.filter(l => l.status === 'Active').length,
    todayCollection: collections.filter(c => c.status === 'Paid').reduce((s, c) => s + c.paidAmount, 0),
    pendingAmount:   collections.filter(c => c.status === 'Pending').reduce((s, c) => s + c.dueAmount, 0),
  };

  return (
    <AppContext.Provider value={{
      isLoggedIn, login, logout,
      sessionChecked,
      theme, toggleTheme,
      customers, addCustomer, updateCustomer, deleteCustomer,
      loans, addLoan, deleteLoan,
      collections, setCollections, markCollectionPaid, markCollectionPending,
      generateCollections,
      loading, loadAll,
      stats,
    }}>
      {children}
    </AppContext.Provider>
  );
};
