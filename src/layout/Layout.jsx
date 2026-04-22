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
    <div className={`flex h-screen overflow-hidden relative ${isDark ? 'bg-[#0a0a0a]' : 'bg-[#fafafa]'}`}>
      
      {/* Premium Background Mesh */}
      <div className="absolute inset-0 pointer-events-none opacity-40 overflow-hidden">
        <div className={`absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[150px] ${isDark ? 'bg-yellow-400/5' : 'bg-blue-400/10'}`} />
        <div className={`absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[150px] ${isDark ? 'bg-orange-500/5' : 'bg-purple-400/10'}`} />
      </div>

      {/* Desktop sidebar — hidden on mobile/tablet */}
      <Sidebar />

      {/* Main column */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative z-10">
        <Navbar />

        {/* Scrollable content — extra bottom padding on mobile for BottomNav */}
        <main className="flex-1 overflow-y-auto scroll-smooth no-scrollbar">
          <div className="p-4 sm:p-5 md:p-8 pb-28 md:pb-8 max-w-[1600px] mx-auto">
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
