import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import AddCustomer from './pages/AddCustomer';
import Loans from './pages/Loans';
import AddLoan from './pages/AddLoan';
import Collection from './pages/Collection';
import Reports from './pages/Reports';
import LoanDetail from './pages/LoanDetail';
import Settings from './pages/Settings';

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

  if (!sessionChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D0D0D]">
        <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return isLoggedIn ? <Layout /> : <Navigate to="/login" replace />;
};

/** Guard: redirect to / if already authenticated */
const PublicRoute = ({ children }) => {
  const { isLoggedIn, sessionChecked } = useApp();

  if (!sessionChecked) return null; // Wait for session check

  return isLoggedIn ? <Navigate to="/" replace /> : children;
};

const App = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <ToasterWrapper />
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
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
