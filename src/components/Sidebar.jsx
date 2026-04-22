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
        w-64 xl:w-72 flex-shrink-0 h-full relative z-20
        ${isDark
          ? 'bg-black/20 border-r border-white/5'
          : 'bg-white/40 border-r border-gray-200 shadow-xl'
        }
        backdrop-blur-xl transition-all duration-500
      `}
    >
      {/* Brand Section */}
      <div className={`px-7 py-8 mb-4`}>
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className={`
             w-12 h-12 rounded-2xl flex items-center justify-center 
             shadow-lg transform transition duration-500 group-hover:rotate-12
             ${isDark ? 'bg-white/10' : 'bg-white shadow-blue-500/10'}
          `}>
            <img src="/logo.png" alt="PJ Finance" className="w-8 h-8 object-contain" />
          </div>
          <div>
            <h1 className={`font-black text-lg tracking-tight leading-none ${isDark ? 'text-white' : 'text-gray-900'}`}>
              PJ Finance
            </h1>
            <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 opacity-50 ${isDark ? 'text-yellow-400' : 'text-blue-600'}`}>
              Enterprise
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-6 overflow-y-auto no-scrollbar">
        <div>
          <p className={`text-[10px] font-black uppercase tracking-[0.2em] px-4 mb-4 opacity-40 ${isDark ? 'text-white' : 'text-black'}`}>
            Operations
          </p>
          <ul className="space-y-1.5">
            {navItems.map(({ path, icon: Icon, label }) => (
              <li key={path}>
                <NavLink
                  to={path}
                  end={path === '/'}
                  className={({ isActive }) =>
                    `group flex items-center gap-4 px-4 py-3.5 rounded-[1.25rem] text-sm font-bold transition-all duration-300
                    ${isActive
                      ? isDark
                        ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/20'
                        : 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                      : isDark
                        ? 'text-gray-400 hover:bg-white/5 hover:text-white'
                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'opacity-100' : 'opacity-60'}`} />
                      <span className="tracking-wide">{label}</span>
                      {isActive && (
                        <div className={`ml-auto w-1.5 h-1.5 rounded-full ${isDark ? 'bg-black' : 'bg-white'}`} />
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Admin Profile */}
      <div className={`px-4 py-6`}>
        <div className={`
          flex items-center gap-4 p-4 rounded-[1.5rem] border
          ${isDark 
            ? 'bg-white/5 border-white/10' 
            : 'bg-white border-gray-100 shadow-sm'
          }
        `}>
          <div className="relative">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shadow-inner ${isDark ? 'bg-yellow-400 text-black' : 'bg-blue-600 text-white'}`}>
              AD
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-current" />
          </div>
          <div className="min-w-0">
            <p className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>Admin User</p>
            <p className={`text-[10px] font-bold opacity-40 truncate ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>ADMIN_CONSOLE_V2</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
