import React from 'react';
import { useApp } from '../context/AppContext';

const Card = ({ children, className = '', onClick }) => {
  const { theme } = useApp();
  const isDark = theme === 'dark';
  return (
    <div
      onClick={onClick}
      className={`card ${isDark ? 'bg-dark-card border border-dark-border' : 'bg-white border border-light-border shadow-sm'} ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
