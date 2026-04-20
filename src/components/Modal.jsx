import React from 'react';
import { X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Button from './Button';

const Modal = ({ isOpen, onClose, title, children, footer, size = 'md' }) => {
  const { theme } = useApp();
  const isDark = theme === 'dark';

  if (!isOpen) return null;

  const sizeClass = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }[size] || 'max-w-lg';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal */}
      <div className={`relative w-full ${sizeClass} rounded-2xl shadow-2xl animate-fade-in ${
        isDark ? 'bg-dark-card border border-dark-border' : 'bg-white border border-light-border'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-dark-border' : 'border-light-border'}`}>
          <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-gray-400 hover:text-white hover:bg-dark-muted' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Body */}
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
        {/* Footer */}
        {footer && (
          <div className={`px-6 py-4 border-t flex items-center justify-end gap-3 ${isDark ? 'border-dark-border' : 'border-light-border'}`}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
