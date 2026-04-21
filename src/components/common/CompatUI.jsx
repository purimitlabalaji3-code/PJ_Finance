import React from 'react';

/**
 * Premium Global Loading Screen
 * Used on app start and during critical data fetches
 */
export const GlobalLoading = () => (
  <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0D0D0D]">
    <div className="relative">
      {/* Animated Rings */}
      <div className="w-16 h-16 rounded-full border-4 border-yellow-400/20" />
      <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-yellow-400 border-t-transparent animate-spin" />
    </div>
    
    <div className="mt-8 text-center animate-pulse">
      <h2 className="text-xl font-bold text-white tracking-tight">PJ Finance</h2>
      <p className="mt-2 text-sm text-gray-500 font-medium">Initializing secure workspace...</p>
    </div>

    {/* Small compatibility hint for low-end devices */}
    <div className="absolute bottom-10 text-[10px] text-gray-700 uppercase tracking-[2px]">
      Optimized for all Android devices
    </div>
  </div>
);

/**
 * Offline / Network Error UI
 */
export const ErrorScreen = ({ message, onRetry }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-[#0D0D0D] p-6 text-center">
    <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mb-6">
      <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>
    
    <h1 className="text-2xl font-bold text-white mb-2">Connection Problem</h1>
    <p className="text-gray-400 text-sm mb-8 max-w-[280px]">
      {message || 'We could not connect to the server. Please check your data connection and try again.'}
    </p>

    <button
      onClick={onRetry || (() => window.location.reload())}
      className="w-full max-w-[200px] py-4 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-2xl transition-all active:scale-95"
    >
      Try Again
    </button>
  </div>
);
