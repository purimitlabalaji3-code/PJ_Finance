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
    toast.success('Signed out of console', {
        icon: '🔒',
        style: {
          borderRadius: '1rem',
          background: isDark ? '#1F2937' : '#FFFFFF',
          color: isDark ? '#F9FAFB' : '#111827',
        },
    });
    navigate('/login');
  };

  const title = pageTitles[pathname] || 'PJ Finance';
  const date = new Date().toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short'
  });

  return (
    <header className={`
      sticky top-0 z-30 flex items-center justify-between
      px-6 py-4 border-b transition-all duration-500
      ${isDark
        ? 'bg-black/10 border-white/5 backdrop-blur-xl'
        : 'bg-white/60 border-gray-100 backdrop-blur-xl shadow-sm'
      }
    `}>

      {/* Left — Mobile Logo + Title */}
      <div className="flex items-center gap-4">
        <div className="lg:hidden p-1.5 rounded-xl bg-white/10 shadow-sm">
          <img 
            src="/logo.png" 
            alt="PJ Finance" 
            className={`w-8 h-8 object-contain transition-all duration-300 ${isDark ? '' : 'invert'}`} 
          />
        </div>
        <div>
          <h2 className={`font-black text-lg leading-tight tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </h2>
          <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 opacity-50 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {date}
          </p>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">

        {/* Notification bell */}
        <button
          className={`
            relative p-2.5 rounded-2xl transition-all duration-300
            ${isDark 
              ? 'text-gray-400 hover:text-white hover:bg-white/5' 
              : 'text-gray-500 hover:bg-gray-100'
            }
          `}
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 border-2 border-current animate-pulse" />
        </button>

        {/* Theme toggle — pill switch */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className={`
            relative flex items-center w-14 h-8 rounded-full p-1
            transition-all duration-500
            ${isDark
              ? 'bg-yellow-400/10 border border-yellow-400/20'
              : 'bg-blue-600/10 border border-blue-600/20'
            }
          `}
        >
          <div className={`
            w-6 h-6 rounded-full flex items-center justify-center
            transition-all duration-500 shadow-lg transform
            ${isDark
              ? 'translate-x-6 bg-yellow-400 rotate-[360deg]'
              : 'translate-x-0 bg-blue-600 rotate-0'
            }
          `}>
            {isDark
              ? <Moon className="w-3.5 h-3.5 text-black" />
              : <Sun className="w-3.5 h-3.5 text-white" />
            }
          </div>
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={`
            flex items-center gap-2 p-2.5 rounded-2xl transition-all duration-300 font-bold text-sm
            ${isDark 
              ? 'text-gray-400 hover:text-red-400 hover:bg-red-400/10' 
              : 'text-gray-500 hover:bg-red-50 hover:text-red-600 shadow-sm'
            }
          `}
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
