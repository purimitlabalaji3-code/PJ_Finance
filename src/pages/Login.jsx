import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Eye, EyeOff, Banknote, Lock, User, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

// Demo credentials
const DEMO_USER = 'admin';
const DEMO_PASS = 'pjfinance123';

const Login = () => {
  const { theme, login } = useApp();
  const isDark = theme === 'dark';

  const [form, setForm] = useState({ username: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => {
    setForm(p => ({ ...p, [field]: e.target.value }));
    if (errors[field]) setErrors(p => ({ ...p, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = 'Username is required';
    if (!form.password.trim()) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(form.username, form.password);
      toast.success('Welcome back, Admin! 👋');
    } catch (err) {
      toast.error(err.message || 'Invalid credentials');
      setErrors({ password: err.message || 'Invalid credentials' });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition-all duration-200 ${
    isDark
      ? 'bg-dark-muted border-dark-border text-white placeholder-gray-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20'
      : 'bg-gray-50 border-light-border text-gray-900 placeholder-gray-400 focus:border-primary-blue focus:ring-2 focus:ring-blue-500/20'
  }`;

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center px-4 py-8 ${isDark ? 'bg-dark-bg' : 'bg-light-bg'}`}>

      {/* Card */}
      <div className={`w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden ${
        isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-light-border'
      }`}>

        {/* Header strip */}
        <div className={`px-6 py-8 text-center ${isDark ? 'bg-yellow-400/5 border-b border-dark-border' : 'bg-blue-50 border-b border-light-border'}`}>
          {/* Logo */}
          <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg ${isDark ? 'bg-yellow-400' : 'bg-primary-blue'}`}>
            <Banknote className={`w-8 h-8 ${isDark ? 'text-black' : 'text-white'}`} />
          </div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>PJ Finance</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Loan Collection Admin Panel</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Username
            </label>
            <div className="relative">
              <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                id="username"
                type="text"
                autoComplete="username"
                placeholder="Enter username"
                value={form.username}
                onChange={set('username')}
                className={`${inputClass} ${errors.username ? 'border-accent-red focus:border-accent-red' : ''}`}
              />
            </div>
            {errors.username && <p className="text-xs text-accent-red mt-1">{errors.username}</p>}
          </div>

          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Password
            </label>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter password"
                value={form.password}
                onChange={set('password')}
                className={`${inputClass} pr-10 ${errors.password ? 'border-accent-red focus:border-accent-red' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-accent-red mt-1">{errors.password}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-200 active:scale-95 mt-2 ${
              loading ? 'opacity-60 cursor-not-allowed' : ''
            } ${
              isDark
                ? 'bg-yellow-400 hover:bg-yellow-300 text-black shadow-lg shadow-yellow-400/20'
                : 'bg-primary-blue hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20'
            }`}
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <>Sign In <ArrowRight className="w-4 h-4" /></>
            )}
          </button>

          {/* Demo credentials hint */}
          <div className={`p-3 rounded-xl text-center text-xs ${isDark ? 'bg-dark-muted text-gray-400' : 'bg-gray-50 text-gray-500'}`}>
            <span className="font-semibold">Demo:</span> admin &nbsp;/&nbsp; pjfinance123
          </div>
        </form>
      </div>

      {/* Footer */}
      <p className={`mt-6 text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
        © 2026 PJ Finance. All rights reserved.
      </p>
    </div>
  );
};

export default Login;
