import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
import { useApp } from '../context/AppContext';

const Layout = () => {
  const { theme } = useApp();
  const isDark = theme === 'dark';

  return (
    <div className={`flex h-screen overflow-hidden ${isDark ? 'bg-dark-bg' : 'bg-light-bg'}`}>
      {/* Desktop sidebar — hidden on mobile/tablet */}
      <Sidebar />

      {/* Main column */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar />

        {/* Scrollable content — extra bottom padding on mobile for BottomNav */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-3 sm:p-4 lg:p-6 pb-24 lg:pb-6 animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile / Tablet bottom navigation */}
      <BottomNav />
    </div>
  );
};

export default Layout;
