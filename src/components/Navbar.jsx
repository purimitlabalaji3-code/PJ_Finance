import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sun, Moon, Bell, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

const pageTitles = {
  '/': 'Dashboard',
  '/customers': 'Customers',
  '/customers/add': 'Add Customer',
  '/loans': 'Loans',
  '/loans/add': 'Add Loan',
  '/collection': 'Daily Collection',
  '/reports': 'Reports',
};

const Navbar = () => {
  const { theme, toggleTheme, logout } = useApp();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isDark = theme === 'dark';

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const title = pageTitles[pathname] || 'PJ Finance';
  const date = new Date().toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short'
  });

  return (
    <header className={`
      sticky top-0 z-30 flex items-center justify-between
      px-4 py-3 border-b
      ${isDark
        ? 'bg-dark-bg/90 border-dark-border backdrop-blur-md'
        : 'bg-white/90 border-light-border backdrop-blur-md shadow-sm'
      }
    `}>

      {/* Left — Logo (mobile) + Title */}
      <div className="flex items-center gap-2.5">
        <img 
          src="/logo.png" 
          alt="PJ Finance" 
          className={`lg:hidden w-8 h-8 rounded-lg object-contain shadow-sm transition-all duration-300 ${isDark ? 'bg-white/10' : 'invert hue-rotate-180 brightness-110'}`} 
        />
        <div>
          <h2 className={`font-bold text-base leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </h2>
          <p className={`text-[10px] leading-none mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {date}
          </p>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1.5 sm:gap-2">

        {/* Notification bell */}
        <button
          className={`relative p-2 rounded-xl transition-colors ${isDark ? 'text-gray-400 hover:text-white hover:bg-dark-muted' : 'text-gray-500 hover:bg-gray-100'}`}
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-accent-red animate-pulse-soft" />
        </button>

        {/* Theme toggle — pill switch */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className={`
            relative flex items-center w-14 h-7 rounded-full p-1
            transition-all duration-300
            ${isDark
              ? 'bg-yellow-400/20 border border-yellow-400/30'
              : 'bg-blue-100 border border-blue-200'
            }
          `}
        >
          <span className={`
            w-5 h-5 rounded-full flex items-center justify-center
            transition-all duration-300 shadow-md
            ${isDark
              ? 'translate-x-7 bg-yellow-400'
              : 'translate-x-0 bg-primary-blue'
            }
          `}>
            {isDark
              ? <Moon className="w-3 h-3 text-black" />
              : <Sun className="w-3 h-3 text-white" />
            }
          </span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
