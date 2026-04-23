import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { GoogleLogin } from '@react-oauth/google';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const { theme, login, googleLogin } = useApp();
  const isDark = theme === 'dark';

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const set = (field) => (e) => {
    setForm(p => ({ ...p, [field]: e.target.value }));
    if (errors[field]) setErrors(p => ({ ...p, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = 'Required';
    if (!form.password.trim()) e.password = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(form.email.trim(), form.password);
      toast.success('Welcome back, Admin!', {
        icon: '💎',
        style: {
          borderRadius: '1rem',
          background: isDark ? '#1F2937' : '#FFFFFF',
          color: isDark ? '#F9FAFB' : '#111827',
        },
      });
    } catch (err) {
      toast.error(err.message || 'Invalid credentials');
      setErrors({ password: 'Login failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      await googleLogin(credentialResponse.credential);
      toast.success('Welcome back, Admin!', {
        icon: '💎',
        style: {
          borderRadius: '1rem',
          background: isDark ? '#1F2937' : '#FFFFFF',
          color: isDark ? '#F9FAFB' : '#111827',
        },
      });
    } catch (err) {
      toast.error(err.message || 'Google Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-700 ${isDark ? 'bg-[#050505]' : 'bg-[#F3F4F6]'}`}>
      
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-40 animate-pulse ${isDark ? 'bg-yellow-500/20' : 'bg-blue-400/20'}`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-40 animate-pulse delay-700 ${isDark ? 'bg-orange-500/10' : 'bg-purple-400/20'}`} />
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] ${isDark ? 'invert-0' : 'invert'}`} 
             style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className={`w-full max-w-sm px-4 z-10 transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
        
        {/* Glass Card */}
        <div className={`
          relative backdrop-blur-2xl rounded-[2rem] border shadow-2xl overflow-hidden
          ${isDark 
            ? 'bg-white/5 border-white/10 shadow-black/50' 
            : 'bg-white/70 border-white shadow-blue-500/10'
          }
        `}>
          
          {/* Header Section */}
          <div className="relative px-6 pt-8 pb-4 text-center">
            <div className="relative inline-block mb-4 group">
              <div className={`absolute -inset-4 rounded-full blur-xl opacity-40 group-hover:opacity-70 transition duration-500 ${isDark ? 'bg-yellow-400' : 'bg-blue-500'}`} />
              <div className={`
                relative w-20 h-20 rounded-3xl mx-auto flex items-center justify-center 
                transform transition duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-2xl overflow-hidden
                ${isDark ? 'bg-dark-muted' : 'bg-white'}
              `}>
                <img src="/logo.png" alt="PJ Finance" className="w-12 h-12 object-contain" />
              </div>
              <Sparkles className={`absolute -top-1 -right-1 w-5 h-5 animate-bounce ${isDark ? 'text-yellow-400' : 'text-blue-500'}`} />
            </div>
            
            <h1 className={`text-3xl font-extrabold tracking-tight mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              PJ Finance
            </h1>
            <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Premium Loan Management Console
            </p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="px-6 pb-8 space-y-4">
            
            <div className="space-y-4">
              {/* Email Input */}
              <div className="group">
                <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ml-1 transition-colors ${isDark ? 'text-gray-500 group-focus-within:text-yellow-400' : 'text-gray-400 group-focus-within:text-blue-600'}`}>
                  Admin Access
                </label>
                <div className="relative">
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isDark ? 'text-gray-600 group-focus-within:text-yellow-400' : 'text-gray-400 group-focus-within:text-blue-600'}`} />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={form.email}
                    onChange={set('email')}
                    className={`
                      w-full pl-10 pr-4 py-3 rounded-xl border-2 outline-none transition-all duration-300 font-medium text-sm
                      ${isDark 
                        ? 'bg-black/20 border-white/5 text-white placeholder-gray-600 focus:border-yellow-400/50 focus:bg-black/40' 
                        : 'bg-white/50 border-gray-100 text-gray-900 placeholder-gray-400 focus:border-blue-500/50 focus:bg-white'
                      }
                      ${errors.email ? 'border-red-500/50 focus:border-red-500' : ''}
                    `}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="group">
                <div className="flex justify-between items-end mb-2 ml-1">
                  <label className={`block text-xs font-bold uppercase tracking-widest transition-colors ${isDark ? 'text-gray-500 group-focus-within:text-yellow-400' : 'text-gray-400 group-focus-within:text-blue-600'}`}>
                    Secure Key
                  </label>
                </div>
                <div className="relative">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isDark ? 'text-gray-600 group-focus-within:text-yellow-400' : 'text-gray-400 group-focus-within:text-blue-600'}`} />
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={set('password')}
                    className={`
                      w-full pl-10 pr-10 py-3 rounded-xl border-2 outline-none transition-all duration-300 font-medium text-sm
                      ${isDark 
                        ? 'bg-black/20 border-white/5 text-white placeholder-gray-600 focus:border-yellow-400/50 focus:bg-black/40' 
                        : 'bg-white/50 border-gray-100 text-gray-900 placeholder-gray-400 focus:border-blue-500/50 focus:bg-white'
                      }
                      ${errors.password ? 'border-red-500/50 focus:border-red-500' : ''}
                    `}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(p => !p)}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors hover:scale-110 active:scale-90 ${isDark ? 'text-gray-600 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Remember & Forgot Logic could go here */}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className={`
                relative w-full py-3 rounded-xl font-bold text-sm transition-all duration-300 transform active:scale-[0.98]
                flex items-center justify-center gap-3 group overflow-hidden
                ${isDark
                  ? 'bg-yellow-400 text-black hover:bg-yellow-300 shadow-[0_10px_20px_-10px_rgba(250,204,21,0.5)]'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-[0_10px_20px_-10px_rgba(37,99,235,0.5)]'
                }
                ${loading ? 'opacity-80 cursor-not-allowed' : ''}
              `}
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-[-20deg]" />
              {loading ? (
                <div className="w-6 h-6 border-3 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Authenticating</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`} />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className={`px-2 ${isDark ? 'bg-[#151515] text-gray-500' : 'bg-white text-gray-400'}`}>
                  Or Secure Access Via
                </span>
              </div>
            </div>

            {/* Google Login Button Container */}
            <div className="flex justify-center w-full">
              <div className="w-full transform transition hover:scale-[1.02] active:scale-[0.98]">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast.error('Google Sign-In failed')}
                  useOneTap
                  theme={isDark ? 'filled_black' : 'outline'}
                  shape="pill"
                  width="100%"
                  size="large"
                  text="continue_with"
                  uxMode="redirect"
                />
              </div>
            </div>
          </form>

          {/* Footer Info */}
          <div className={`px-8 py-4 text-center border-t flex items-center justify-center gap-2 ${isDark ? 'bg-white/5 border-white/5 text-gray-500' : 'bg-gray-50/50 border-gray-100 text-gray-400'}`}>
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[10px] uppercase font-bold tracking-widest">End-to-End Encrypted Session</span>
          </div>
        </div>

        {/* System Copyright */}
        <div className={`mt-8 text-center transition-all duration-1000 delay-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
           <p className={`text-xs font-medium tracking-wide ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
            &copy; 2026 PJ FINANCE &bull; ENTERPRISE SECURE ACCESS
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
