import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider, useApp } from '@/context/AppContext';
import { GlobalLoading } from '@/components/common/CompatUI';

// ── Lazy Load Pages ─────────────────────────────────────────────
const Layout      = lazy(() => import('@/layout/Layout'));
const Dashboard   = lazy(() => import('@/pages/Dashboard'));
const Customers   = lazy(() => import('@/pages/Customers'));
const AddCustomer = lazy(() => import('@/pages/AddCustomer'));
const Loans       = lazy(() => import('@/pages/Loans'));
const AddLoan     = lazy(() => import('@/pages/AddLoan'));
const Collection  = lazy(() => import('@/pages/Collection'));
const Reports     = lazy(() => import('@/pages/Reports'));
const LoanDetail  = lazy(() => import('@/pages/LoanDetail'));
const Settings    = lazy(() => import('@/pages/Settings'));
const Login       = lazy(() => import('@/pages/Login'));

/** Shows themed toasts */
const ToasterWrapper = () => {
  const { theme } = useApp();
  const isDark = theme === 'dark';
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: isDark ? '#1A1A1A' : '#fff',
          color: isDark ? '#fff' : '#111',
          border: isDark ? '1px solid #2A2A2A' : '1px solid #E5E7EB',
          borderRadius: '0.75rem',
          fontSize: '0.875rem',
        },
      }}
    />
  );
};

const App = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AppProvider>
  );
};

const AppContent = () => {
  const { isLoggedIn, sessionChecked } = useApp();
  const [fade, setFade] = React.useState(false);

  React.useEffect(() => {
    if (sessionChecked) {
      setTimeout(() => setFade(true), 50);
    }
  }, [sessionChecked, isLoggedIn]);

  if (!sessionChecked) return <GlobalLoading />;

  return (
    <div className={`transition-opacity duration-700 ${fade ? 'opacity-100' : 'opacity-0'}`}>
      <ToasterWrapper />
      <Suspense fallback={<GlobalLoading />}>
        <Routes>
          {!isLoggedIn ? (
            <>
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </>
          ) : (
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/customers/add" element={<AddCustomer />} />
              <Route path="/loans" element={<Loans />} />
              <Route path="/loans/add" element={<AddLoan />} />
              <Route path="/loans/:id" element={<LoanDetail />} />
              <Route path="/collection" element={<Collection />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              {/* Redirect /login to / if already logged in */}
              <Route path="/login" element={<Navigate to="/" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          )}
        </Routes>
      </Suspense>
    </div>
  );
};

export default App;
