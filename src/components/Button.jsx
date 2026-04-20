import React from 'react';
import { useApp } from '../context/AppContext';

const variants = {
  primary: {
    dark: 'bg-yellow-400 hover:bg-yellow-300 text-black shadow-lg shadow-yellow-400/20',
    light: 'bg-primary-blue hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20',
  },
  danger: {
    dark: 'bg-accent-red hover:bg-red-400 text-white shadow-lg shadow-red-500/20',
    light: 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20',
  },
  ghost: {
    dark: 'bg-dark-muted hover:bg-dark-border text-gray-300 border border-dark-border',
    light: 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200',
  },
  success: {
    dark: 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20',
    light: 'bg-accent-green hover:bg-green-600 text-white shadow-lg shadow-green-500/20',
  },
  warning: {
    dark: 'bg-orange-500 hover:bg-orange-400 text-white',
    light: 'bg-orange-500 hover:bg-orange-600 text-white',
  },
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

const Button = ({ children, variant = 'primary', size = 'md', className = '', disabled = false, loading = false, icon: Icon, ...props }) => {
  const { theme } = useApp();
  const isDark = theme === 'dark';
  const variantClass = variants[variant]?.[isDark ? 'dark' : 'light'] || variants.primary[isDark ? 'dark' : 'light'];
  const sizeClass = sizes[size] || sizes.md;

  return (
    <button
      className={`btn ${variantClass} ${sizeClass} rounded-xl font-semibold transition-all duration-200 ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading
        ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        : Icon && <Icon className="w-4 h-4 flex-shrink-0" />
      }
      {children}
    </button>
  );
};

export default Button;
