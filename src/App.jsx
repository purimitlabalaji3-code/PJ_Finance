import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider, useApp } from './context/AppContext';
import { GlobalLoading, ErrorScreen } from './components/common/CompatUI';

// ── Lazy Load Pages for Performance ───────────────────────────────
const Layout      = lazy(() => import('./layout/Layout'));
const Login       = lazy(() => import('./pages/Login'));
const Dashboard   = lazy(() => import('./pages/Dashboard'));
const Customers   = lazy(() => import('./pages/Customers'));
const AddCustomer = lazy(() => import('./pages/AddCustomer'));
const Loans       = lazy(() => import('./pages/Loans'));
const AddLoan     = lazy(() => import('./pages/AddLoan'));
const Collection  = lazy(() => import('./pages/Collection'));
const Reports     = lazy(() => import('./pages/Reports'));
const LoanDetail  = lazy(() => import('./pages/LoanDetail'));
const Settings    = lazy(() => import('./pages/Settings'));

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
          boxShadow: '0 20px 40px rgb(0 0 0 / 0.2)',
        },
        success: { iconTheme: { primary: '#10B981', secondary: isDark ? '#1A1A1A' : '#fff' } },
        error: { iconTheme: { primary: '#FF3B3B', secondary: isDark ? '#1A1A1A' : '#fff' } },
      }}
    />
  );
};

/** Guard: redirect to /login if not authenticated */
const PrivateLayout = () => {
  const { isLoggedIn, sessionChecked } = useApp();

  if (!sessionChecked) return <GlobalLoading />;

  return isLoggedIn ? <Layout /> : <Navigate to="/login" replace />;
};

/** Guard: redirect to / if already authenticated */
const PublicRoute = ({ children }) => {
  const { isLoggedIn, sessionChecked } = useApp();

  if (!sessionChecked) return null; // Wait for session check silently

  return isLoggedIn ? <Navigate to="/" replace /> : children;
};

const App = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <ToasterWrapper />
        <Suspense fallback={<GlobalLoading />}>
          <Routes>
            {/* Public route */}
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

            {/* Protected routes — all rendered inside Layout */}
            <Route element={<PrivateLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/customers/add" element={<AddCustomer />} />
              <Route path="/loans" element={<Loans />} />
              <Route path="/loans/add" element={<AddLoan />} />
              <Route path="/loans/:id" element={<LoanDetail />} />
              <Route path="/collection" element={<Collection />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
