import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import Card from '../components/Card';
import { KeyRound, ImagePlus, FileText, Eye, EyeOff, Save, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';

const SectionTitle = ({ icon: Icon, title, subtitle, color }) => {
  const { theme } = useApp();
  const isDark = theme === 'dark';
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h3 className={`font-bold text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{subtitle}</p>
      </div>
    </div>
  );
};

const Settings = () => {
  const { theme } = useApp();
  const isDark = theme === 'dark';

  // ── Password state ──────────────────────────────────────
  const [pw, setPw] = useState({ current: '', newPw: '', confirm: '' });
  const [show, setShow] = useState({ current: false, newPw: false, confirm: false });

  const handlePwChange = (e) => setPw(p => ({ ...p, [e.target.name]: e.target.value }));
  const toggleShow = (field) => setShow(s => ({ ...s, [field]: !s[field] }));

  const handleSavePw = () => {
    if (!pw.current || !pw.newPw || !pw.confirm) return toast.error('Fill all password fields');
    if (pw.newPw !== pw.confirm) return toast.error('New passwords do not match');
    if (pw.newPw.length < 6) return toast.error('Password must be at least 6 characters');
    toast.success('Password updated successfully!');
    setPw({ current: '', newPw: '', confirm: '' });
  };

  // ── Logo state ──────────────────────────────────────────
  const [logo, setLogo] = useState(null);
  const logoRef = useRef();

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('Please upload a valid image');
    const reader = new FileReader();
    reader.onload = () => setLogo(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSaveLogo = () => {
    if (!logo) return toast.error('No logo selected');
    toast.success('Logo saved successfully!');
  };

  // ── PDF Structure state ─────────────────────────────────
  const [pdf, setPdf] = useState({
    companyName: 'PJ Finance',
    address: '',
    phone: '',
    footer: 'Thank you for your payment.',
    showLogo: true,
    showTimeline: true,
    showSummary: true,
  });

  const handlePdfChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPdf(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSavePdf = () => {
    toast.success('PDF structure saved!');
  };

  const inputCls = `w-full px-3 py-2.5 rounded-xl text-sm outline-none border transition-all duration-200 ${
    isDark
      ? 'bg-dark-muted border-dark-border text-white placeholder-gray-600 focus:border-yellow-400/50'
      : 'bg-gray-50 border-light-border text-gray-900 placeholder-gray-400 focus:border-blue-400'
  }`;

  const checkCls = `w-4 h-4 rounded accent-yellow-400 cursor-pointer`;

  return (
    <div className="space-y-5 max-w-lg mx-auto pb-24 lg:pb-6">
      {/* Header */}
      <div>
        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Settings</h2>
        <p className={`text-sm mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Manage your app configuration</p>
      </div>

      {/* ─── Change Password ─────────────────────────────── */}
      <Card>
        <SectionTitle
          icon={KeyRound}
          title="Change Password"
          subtitle="Update your admin login password"
          color={isDark ? 'bg-yellow-400/10 text-yellow-400' : 'bg-blue-50 text-primary-blue'}
        />
        <div className="space-y-3">
          {[
            { name: 'current', label: 'Current Password', field: 'current' },
            { name: 'newPw',   label: 'New Password',     field: 'newPw' },
            { name: 'confirm', label: 'Confirm Password', field: 'confirm' },
          ].map(({ name, label, field }) => (
            <div key={name}>
              <label className={`text-xs font-semibold block mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</label>
              <div className="relative">
                <input
                  type={show[field] ? 'text' : 'password'}
                  name={name}
                  value={pw[name]}
                  onChange={handlePwChange}
                  placeholder="••••••••"
                  className={`${inputCls} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => toggleShow(field)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {show[field] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={handleSavePw}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 ${
              isDark ? 'bg-yellow-400 text-black hover:bg-yellow-300' : 'bg-primary-blue text-white hover:opacity-90'
            }`}
          >
            <Save className="w-4 h-4" /> Save Password
          </button>
        </div>
      </Card>

      {/* ─── Logo Upload ─────────────────────────────────── */}
      <Card>
        <SectionTitle
          icon={ImagePlus}
          title="Company Logo"
          subtitle="Used in PDF reports and app header"
          color={isDark ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600'}
        />
        <div className="space-y-3">
          {/* Preview / Drop Area */}
          <div
            onClick={() => logoRef.current?.click()}
            className={`relative w-full h-36 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
              isDark
                ? 'border-dark-border hover:border-yellow-400/40 bg-dark-muted'
                : 'border-light-border hover:border-blue-300 bg-gray-50'
            }`}
          >
            {logo ? (
              <>
                <img src={logo} alt="Logo preview" className="h-24 object-contain rounded-xl" />
                <button
                  onClick={(e) => { e.stopPropagation(); setLogo(null); }}
                  className="absolute top-2 right-2 p-1 rounded-full bg-red-500/80 text-white hover:bg-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </>
            ) : (
              <>
                <Upload className={`w-7 h-7 mb-2 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Tap to upload logo</p>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>PNG, JPG, SVG — max 2MB</p>
              </>
            )}
          </div>
          <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
          <button
            onClick={handleSaveLogo}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 ${
              isDark ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/20' : 'bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-100'
            }`}
          >
            <Save className="w-4 h-4" /> Save Logo
          </button>
        </div>
      </Card>

      {/* ─── PDF Structure ───────────────────────────────── */}
      <Card>
        <SectionTitle
          icon={FileText}
          title="PDF Structure"
          subtitle="Customize what appears in exported reports"
          color={isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-green-50 text-green-600'}
        />
        <div className="space-y-3">
          <div>
            <label className={`text-xs font-semibold block mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Company Name</label>
            <input name="companyName" value={pdf.companyName} onChange={handlePdfChange} className={inputCls} placeholder="PJ Finance" />
          </div>
          <div>
            <label className={`text-xs font-semibold block mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Address</label>
            <input name="address" value={pdf.address} onChange={handlePdfChange} className={inputCls} placeholder="123, Main St, Chennai - 600001" />
          </div>
          <div>
            <label className={`text-xs font-semibold block mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Phone Number</label>
            <input name="phone" value={pdf.phone} onChange={handlePdfChange} className={inputCls} placeholder="+91 98765 43210" />
          </div>
          <div>
            <label className={`text-xs font-semibold block mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Footer Note</label>
            <input name="footer" value={pdf.footer} onChange={handlePdfChange} className={inputCls} placeholder="Thank you for your payment." />
          </div>

          {/* Show/Hide Toggles */}
          <div className={`rounded-xl p-3 space-y-2.5 ${isDark ? 'bg-dark-muted' : 'bg-gray-50'}`}>
            <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Include in PDF</p>
            {[
              { name: 'showLogo',     label: 'Company Logo' },
              { name: 'showTimeline', label: 'Payment Timeline' },
              { name: 'showSummary',  label: 'Loan Summary' },
            ].map(({ name, label }) => (
              <label key={name} className="flex items-center justify-between cursor-pointer">
                <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{label}</span>
                <input type="checkbox" name={name} checked={pdf[name]} onChange={handlePdfChange} className={checkCls} />
              </label>
            ))}
          </div>

          <button
            onClick={handleSavePdf}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 ${
              isDark ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/20' : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-100'
            }`}
          >
            <Save className="w-4 h-4" /> Save PDF Settings
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Settings;
