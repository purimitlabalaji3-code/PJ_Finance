import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

// ── Safe localStorage wrappers (only used for theme now) ────────────────────
const store = {
  get: (key) => { try { return localStorage.getItem(key); } catch { return null; } },
  set: (key, val) => { try { localStorage.setItem(key, val); } catch { /* ignore */ } },
  remove: (key) => { try { localStorage.removeItem(key); } catch { /* ignore */ } },
};
import {
  apiLogin, apiGoogleLogin, apiFetchMe, apiLogout,
  apiFetchCustomers, apiAddCustomer, apiUpdateCustomer, apiDeleteCustomer,
  apiFetchLoans, apiAddLoan, apiDeleteLoan,
  apiFetchCollections, apiFetchAllCollections, apiGenerateCollections, apiAddManualCollection, apiMarkPaid, apiMarkUnpaid,
  apiFetchCollectionSummary,
} from '@/utils/api';

import toast from 'react-hot-toast';
import { debounce } from 'lodash';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

// ── Normalizers defined at module scope so they're always available ──────────
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
};
const normalLoan = (l) => ({
  id:           l.id,
  loanCode:     l.loan_code,
  customerId:   l.customer_id,
  customerCode: l.customer_code,
  customerName: l.customer_name,
  loanAmount:   Number(l.loan_amount),
  interest:     Number(l.interest),
  totalAmount:  Number(l.total_amount),
  dailyAmount:  Number(l.daily_amount),
  startDate:    formatDate(l.start_date),
  status:       l.status,
  paidDays:     l.paid_days,
  totalDays:    l.total_days,
  totalCollected: Number(l.total_collected || 0),
  loanType:     l.loan_type || 'Daily',
});

const normalCollection = (c) => ({
  id:           c.id,
  loanId:       c.loan_id,
  customerId:   c.customer_id,
  customerCode: c.customer_code,
  customerName: c.customer_name,
  phone:        c.phone,
  dueAmount:    Number(c.due_amount),
  paidAmount:   Number(c.paid_amount),
  totalAmount:  Number(c.total_amount),
  paidDays:     Number(c.paid_days),
  dailyAmount:  Number(c.daily_amount),
  date:         formatDate(c.date),
  status:       c.status,
});

const normalCustomer = (c) => ({
  id:           c.id,
  customerCode: c.customer_code,
  name:         c.name,
  phone:        c.phone,
  age:          c.age,
  gender:       c.gender,
  aadhaar:      c.aadhaar,
  address:      c.address,
  status:       c.status,
  image:        c.image,
  joinDate:     formatDate(c.join_date),
});

export const AppProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => store.get('pj-theme') || 'dark');
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [sessionChecked, setSessionChecked] = useState(true); // Always ready — no login needed

  const [customers, setCustomers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [collections, setCollections] = useState([]);
  const [allCollections, setAllCollections] = useState([]);
  const [collectionSummary, setCollectionSummary] = useState([]);
  // Use local date (not UTC) so IST users see the correct day
  const [collectionDate, setCollectionDate] = useState(() => new Date().toLocaleDateString('en-CA'));
  const [loading, setLoading] = useState(false);

  // ── Theme ──────────────────────────────────────────────────────────
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.classList.toggle('light', theme !== 'dark');
    store.set('pj-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  // ── Session Check (Bypassed — App opens directly to Dashboard) ─────
  // Login is disabled. Data loads automatically on startup.

  const login = async (email, password) => {
    try {
      const response = await apiLogin(email, password);
      if (response.success && response.session?.token) {
        store.set('pj_backup_token', response.session.token); // Secure mobile fallback
      }
      setIsLoggedIn(true);
      await loadAll();
      return response;
    } catch (err) {
      setIsLoggedIn(false);
      throw err;
    }
  };

  const googleLogin = async (credential) => {
    try {
      const response = await apiGoogleLogin(credential);
      if (response.success && response.session?.token) {
        store.set('pj_backup_token', response.session.token);
      }
      setIsLoggedIn(true);
      await loadAll();
      return response;
    } catch (err) {
      setIsLoggedIn(false);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch {
      // Ignore
    } finally {
      store.remove('pj_backup_token');
      setIsLoggedIn(false);
      setCustomers([]);
      setLoans([]);
      setCollections([]);
    }
  };

  // ── Data Loading (Optimized) ─────────────────────────────────────────
  // Debounce the load to prevent rapid fire re-renders/fetches
  const debouncedLoad = useMemo(
    () => debounce(async (date, isLoggedIn) => {
      if (!isLoggedIn) return;
      setLoading(true);
      try {
        // 1. Generate/Fetch today's specific collections
        await apiGenerateCollections(date).catch(() => {});
        const [c, l, colToday, summary] = await Promise.all([
          apiFetchCustomers(),
          apiFetchLoans(),
          apiFetchCollections(date),
          apiFetchCollectionSummary().catch(() => []),
        ]);

        setCustomers(Array.isArray(c) ? c.map(normalCustomer) : []);
        setLoans(Array.isArray(l) ? l.map(normalLoan) : []);
        setCollections(Array.isArray(colToday) ? colToday.map(normalCollection) : []);
        setCollectionSummary(Array.isArray(summary) ? summary : []);

        // 2. Fetch full history ONLY if we don't have it yet to save significant bandwidth
        // History is large and doesn't change every second.
        setAllCollections(prev => {
          if (prev.length === 0) {
            apiFetchAllCollections().then(hist => {
              setAllCollections(Array.isArray(hist) ? hist.map(normalCollection) : []);
            });
          }
          return prev;
        });

      } catch (err) {
        console.error('Load error:', err);
        if (err.message === 'Session expired' || err.message === 'No token') {
          logout();
        } else {
          toast.error('Failed to load data. Check connection.');
        }
      } finally {
        setLoading(false);
      }
    }, 400),
    [logout]
  );

  const loadAll = useCallback(() => {
    debouncedLoad(collectionDate, isLoggedIn);
  }, [debouncedLoad, collectionDate, isLoggedIn]);

  useEffect(() => { 
    loadAll(); 
    return () => debouncedLoad.cancel();
  }, [loadAll]);

  // Handle changing collection date manually (re-fetches only collections to save bandwidth)
  const changeCollectionDate = async (newDate) => {
    setCollectionDate(newDate);
    setLoading(true);
    try {
      // Auto-generate collections for the selected date
      await apiGenerateCollections(newDate).catch(() => {});

      const col = await apiFetchCollections(newDate);
      setCollections(Array.isArray(col) ? col.map(normalCollection) : []);
    } catch (err) {
      toast.error('Failed to load collections for selected date');
    } finally {
      setLoading(false);
    }
  };

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

    // Auto-generate today's collection entry for the new loan, then refresh collections
    try {
      await apiGenerateCollections(collectionDate).catch(() => {});
      const col = await apiFetchCollections(collectionDate);
      setCollections(Array.isArray(col) ? col.map(normalCollection) : []);
    } catch {
      // Non-blocking — collections will still load on next refresh
    }

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
    setAllCollections(prev => prev.map(c => c.id === id ? nc : c));
    setLoans(prev => prev.map(l =>
      l.id === nc.loanId ? { ...l, paidDays: l.paidDays + 1 } : l
    ));
    // Quietly update history in background after a mutation
    apiFetchAllCollections().then(hist => {
      setAllCollections(Array.isArray(hist) ? hist.map(normalCollection) : []);
    });
  };

  const addManualCollection = async (data) => {
    await apiAddManualCollection(data);
    loadAll();
  };

  const markCollectionPending = async (id) => {
    const row = await apiMarkUnpaid(id);
    const nc = normalCollection(row);
    setCollections(prev => prev.map(c => c.id === id ? nc : c));
    setAllCollections(prev => prev.map(c => c.id === id ? nc : c));
    setLoans(prev => prev.map(l =>
      l.id === nc.loanId ? { ...l, paidDays: Math.max(l.paidDays - 1, 0) } : l
    ));
    // Quietly update history in background
    apiFetchAllCollections().then(hist => {
      setAllCollections(Array.isArray(hist) ? hist.map(normalCollection) : []);
    });
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
      isLoggedIn, login, googleLogin, logout,
      sessionChecked,
      theme, toggleTheme,
      customers, addCustomer, updateCustomer, deleteCustomer,
      loans, addLoan, deleteLoan,
      collections, setCollections, allCollections, setAllCollections, markCollectionPaid, markCollectionPending,
      generateCollections, addManualCollection, collectionDate, changeCollectionDate,
      collectionSummary,
      loading, loadAll,
      stats,
    }}>
      {children}
    </AppContext.Provider>
  );
};
