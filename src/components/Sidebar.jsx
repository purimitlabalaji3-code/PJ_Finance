import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, CreditCard, BookOpen,
  FileText
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/customers', icon: Users, label: 'Customers' },
  { path: '/loans', icon: CreditCard, label: 'Loans' },
  { path: '/collection', icon: BookOpen, label: 'Collection' },
  { path: '/reports', icon: FileText, label: 'Reports' },
];

// Desktop-only sidebar (hidden on mobile/tablet — BottomNav handles those)
const Sidebar = () => {
  const { theme } = useApp();
  const isDark = theme === 'dark';

  return (
    <aside
      className={`
        hidden md:flex flex-col
        w-60 xl:w-64 flex-shrink-0 h-full
        ${isDark
          ? 'bg-dark-card border-r border-dark-border'
          : 'bg-white border-r border-light-border'
        }
      `}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-5 py-5 border-b ${isDark ? 'border-dark-border' : 'border-light-border'}`}>
        <img 
          src="/logo.png" 
          alt="PJ Finance" 
          className={`w-10 h-10 rounded-xl object-contain shadow-sm transition-all duration-300 ${isDark ? 'bg-white/10' : 'invert hue-rotate-180 brightness-110'}`} 
        />
        <div>
          <h1 className={`font-bold text-base leading-none ${isDark ? 'text-white' : 'text-gray-900'}`}>PJ Finance</h1>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Loan Management</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className={`text-[10px] font-bold uppercase tracking-widest px-3 mb-2 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Menu</p>
        <ul className="space-y-0.5">
          {navItems.map(({ path, icon: Icon, label }) => (
            <li key={path}>
              <NavLink
                to={path}
                end={path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive
                    ? isDark
                      ? 'bg-yellow-400/10 text-yellow-400'
                      : 'bg-blue-50 text-primary-blue'
                    : isDark
                      ? 'text-gray-400 hover:bg-dark-muted hover:text-gray-200'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                      isActive
                        ? isDark ? 'bg-yellow-400/20' : 'bg-blue-100'
                        : isDark ? 'bg-dark-muted' : 'bg-gray-100'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </span>
                    {label}
                    {isActive && (
                      <span className={`ml-auto w-1.5 h-1.5 rounded-full ${isDark ? 'bg-yellow-400' : 'bg-primary-blue'}`} />
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Admin Footer */}
      <div className={`px-4 py-4 border-t ${isDark ? 'border-dark-border' : 'border-light-border'}`}>
        <div className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? 'bg-dark-muted' : 'bg-gray-50'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isDark ? 'bg-yellow-400 text-black' : 'bg-primary-blue text-white'}`}>
            AD
          </div>
          <div className="min-w-0">
            <p className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>Admin</p>
            <p className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>pjfinance.in</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
