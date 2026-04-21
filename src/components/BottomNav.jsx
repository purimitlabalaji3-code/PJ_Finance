import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, CreditCard,
  BookOpen, FileText, Settings
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/customers', icon: Users, label: 'Customers' },
  { path: '/loans', icon: CreditCard, label: 'Loans' },
  { path: '/collection', icon: BookOpen, label: 'Collection' },
  { path: '/reports', icon: FileText, label: 'Reports' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

const BottomNav = () => {
  const { theme } = useApp();
  const isDark = theme === 'dark';

  return (
    <nav
      className={`
        fixed bottom-0 left-0 right-0 z-50
        flex items-stretch
        md:hidden
        ${isDark
          ? 'bg-dark-card border-t border-dark-border'
          : 'bg-white border-t border-light-border'
        }
        shadow-[0_-4px_24px_rgba(0,0,0,0.15)]
      `}
    >
      {navItems.map(({ path, icon: Icon, label }) => (
        <NavLink
          key={path}
          to={path}
          end={path === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 py-2 px-1 gap-0.5 transition-all duration-200 relative
            ${isActive
              ? isDark
                ? 'text-yellow-400'
                : 'text-primary-blue'
              : isDark
                ? 'text-gray-500'
                : 'text-gray-400'
            }`
          }
        >
          {({ isActive }) => (
            <>
              {/* Active indicator line at top */}
              {isActive && (
                <span className={`absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full ${isDark ? 'bg-yellow-400' : 'bg-primary-blue'}`} />
              )}

              {/* Icon with active background pill */}
              <span className={`w-10 h-7 flex items-center justify-center rounded-full transition-all duration-200 ${
                isActive
                  ? isDark
                    ? 'bg-yellow-400/15'
                    : 'bg-blue-50'
                  : ''
              }`}>
                <Icon className={`transition-all duration-200 ${isActive ? 'w-5 h-5' : 'w-5 h-5'}`} />
              </span>

              {/* Label */}
              <span className={`text-[10px] font-semibold leading-none transition-all duration-200 ${
                isActive
                  ? isDark ? 'text-yellow-400' : 'text-primary-blue'
                  : isDark ? 'text-gray-500' : 'text-gray-400'
              }`}>
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
