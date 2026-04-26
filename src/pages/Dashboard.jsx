import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Card from '../components/Card';
import {
  Users, CreditCard, TrendingUp, AlertCircle,
  ArrowUpRight, ArrowDownRight, IndianRupee,
  Wallet, Percent, Zap, Clock, CalendarDays,
  BarChart3, Activity
} from 'lucide-react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';

const StatCard = ({ title, value, icon: Icon, change, changeType, color, prefix, onClick }) => {
  const { theme } = useApp();
  const isDark = theme === 'dark';
  const isPositive = changeType === 'up';

  return (
    <Card 
      onClick={onClick}
      className={`
        group relative overflow-hidden transition-all duration-500 hover:-translate-y-1 px-6 py-6
        ${onClick ? 'cursor-pointer hover:ring-2 hover:ring-primary-blue/30' : 'cursor-default'}
        ${isDark ? 'hover:bg-white/5' : 'hover:bg-white shadow-lg shadow-blue-500/5'}
      `}
    >
      {/* Decorative accent */}
      <div className={`absolute top-0 right-0 w-16 h-16 opacity-[0.03] transition-all duration-500 group-hover:scale-150 ${color}`} style={{ borderRadius: '0 0 0 100%' }} />
      
      <div className="flex items-start justify-between mb-6 relative z-10">
        <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center flex-shrink-0 transition-transform duration-500 group-hover:rotate-6 ${color} shadow-lg shadow-current/10`}>
          <Icon className="w-7 h-7" />
        </div>
        {change && (
          <div className={`
            flex flex-shrink-0 items-center gap-1 font-black px-2.5 py-1 rounded-lg text-[10px] tracking-tighter
            ${isPositive
              ? isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-green-100 text-green-700'
              : isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-100 text-red-700'
            }
          `}>
            {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {change}
          </div>
        )}
      </div>
      
      <div className="relative z-10">
        <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-50 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {title}
        </p>
        <p className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {prefix && <span className="text-sm font-bold opacity-30 mr-1">{prefix}</span>}
          {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
        </p>
      </div>
    </Card>
  );
};

const Dashboard = () => {
  const { stats, loans, customers, collections, collectionSummary, theme, loadAll } = useApp();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  // ── Auto-refresh: poll every 30s + refresh when tab becomes visible ──
  useEffect(() => {
    loadAll();
    const interval = setInterval(loadAll, 30000);
    const onVisible = () => {
      if (document.visibilityState === 'visible') loadAll();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  const chartColor = isDark ? '#FFD700' : '#2563EB';
  const textColor = isDark ? '#9CA3AF' : '#6B7280';
  const gridColor = isDark ? '#2A2A2A' : '#F3F4F6';

  const recentLoans = loans.slice(0, 5);
  const todayPaid = collections.filter(c => c.status === 'Paid').length;
  const todayTotal = collections.length;

  const totalDisbursed = loans.reduce((s, l) => s + Number(l.loanAmount), 0);
  const totalInterest = loans.reduce((s, l) => {
    const interest = Number(l.totalAmount) - Number(l.loanAmount);
    return s + (interest > 0 ? interest : 0);
  }, 0);
  const totalCollectedAllTime = loans.reduce((s, l) => s + (l.totalCollected || 0), 0);

  const totalPaidInterest = loans.reduce((s, l) => {
    if (l.loanType === '15-Day' || l.loanType === 'Monthly') {
      return s + Number(l.totalCollected || 0);
    } else {
      const tot = Number(l.totalAmount);
      const p = Number(l.loanAmount);
      const intPortion = tot > p ? (tot - p) / tot : 0;
      return s + (Number(l.totalCollected || 0) * intPortion);
    }
  }, 0);

  const todayInterestCollected = collections
    .filter(c => c.status === 'Paid')
    .reduce((s, c) => {
      const loan = loans.find(l => l.id === c.loanId);
      if (!loan) return s;
      if (loan.loanType === '15-Day' || loan.loanType === 'Monthly') {
        return s + Number(c.paidAmount);
      } else {
        const tot = Number(loan.totalAmount);
        const p = Number(loan.loanAmount);
        const intPortion = tot > p ? (tot - p) / tot : 0;
        return s + (Number(c.paidAmount) * intPortion);
      }
    }, 0);

  const dailyLoans = loans.filter(l => l.loanType === 'Daily').length;
  const fortnightlyLoans = loans.filter(l => l.loanType === '15-Day').length;
  const monthlyLoans = loans.filter(l => l.loanType === 'Monthly').length;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`px-3 py-2 rounded-xl text-sm shadow-2xl border ${isDark ? 'bg-dark-muted border-dark-border text-white' : 'bg-white border-light-border text-gray-900'}`}>
          <p className="font-semibold mb-1">{label}</p>
          {payload.map((p, i) => (
            <p key={i} style={{ color: p.color }} className="font-medium">
              ₹{p.value.toLocaleString('en-IN')}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Group 1: Customers & Loan Types */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Customers"
          value={customers.length}
          icon={Users}
          color={isDark ? 'bg-cyan-500/10 text-cyan-400' : 'bg-cyan-50 text-cyan-600'}
          onClick={() => navigate('/customers')}
        />
        <StatCard
          title="Daily Loans"
          value={dailyLoans}
          icon={Zap}
          change="Collection"
          changeType="up"
          color={isDark ? 'bg-yellow-400/10 text-yellow-400' : 'bg-yellow-50 text-yellow-600'}
          onClick={() => navigate('/loans?type=Daily')}
        />
        <StatCard
          title="15-Day Loans"
          value={fortnightlyLoans}
          icon={Clock}
          change="Collection"
          changeType="up"
          color={isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}
          onClick={() => navigate('/loans?type=15-Day')}
        />
        <StatCard
          title="Monthly Loans"
          value={monthlyLoans}
          icon={CalendarDays}
          change="Collection"
          changeType="up"
          color={isDark ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600'}
          onClick={() => navigate('/loans?type=Monthly')}
        />
      </div>

      {/* Group 2: Financial Overview (All-Time) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Interest"
          value={Math.round(totalInterest)}
          icon={Percent}
          prefix="₹"
          color={isDark ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600'}
        />
        <StatCard
          title="Total Collected"
          value={Math.round(totalCollectedAllTime)}
          icon={TrendingUp}
          prefix="₹"
          color={isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-green-50 text-green-600'}
        />
        <StatCard
          title="Remaining Bal."
          value={Math.round(totalDisbursed + totalInterest - totalCollectedAllTime)}
          icon={Wallet}
          change="In market"
          changeType="up"
          prefix="₹"
          color={isDark ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-50 text-orange-600'}
        />
        <StatCard
          title="Today Collected"
          value={stats.todayCollection}
          icon={IndianRupee}
          prefix="₹"
          color={isDark ? 'bg-yellow-400/10 text-yellow-400' : 'bg-yellow-50 text-yellow-600'}
        />
      </div>

      {/* Group 3: Market & Daily Status */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Today Pending"
          value={stats.pendingAmount}
          icon={AlertCircle}
          prefix="₹"
          color={isDark ? 'bg-red-500/10 text-accent-red' : 'bg-red-50 text-red-500'}
        />
        <StatCard
          title="Efficiency"
          value={`${Math.round(efficiency)}%`}
          icon={Activity}
          change="Collection rate"
          changeType="up"
          color={isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-green-50 text-green-600'}
        />
        <StatCard
          title="Total Active"
          value={loans.filter(l => l.status === 'Active').length}
          icon={Zap}
          change="All Types"
          changeType="up"
          color={isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-green-50 text-green-600'}
        />
        <StatCard
          title="Total Disbursed"
          value={totalDisbursed}
          icon={CreditCard}
          prefix="₹"
          color={isDark ? 'bg-gray-500/10 text-gray-400' : 'bg-gray-50 text-gray-600'}
          onClick={() => navigate('/loans')}
        />
      </div>

      {/* Weekly Bar & Today Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="mb-5 flex justify-between items-end">
            <div>
              <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>Collection Performance</h3>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Daily progress overview</p>
            </div>
            <div className={`text-xs font-bold px-3 py-1.5 rounded-lg ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-green-50 text-green-600'}`}>
              ₹{stats.todayCollection.toLocaleString('en-IN')} Today
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={collectionSummary.length > 0 ? collectionSummary : [{day: '...', amount: 0}]} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid vertical={false} stroke={gridColor} strokeDasharray="3 3" />
              <XAxis dataKey="day" tick={{ fill: textColor, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: textColor, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? '#ffffff05' : '#00000005' }} />
              <Bar dataKey="amount" fill={chartColor} radius={[6, 6, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="flex flex-col">
          <h3 className={`font-bold text-lg mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Today's Status</h3>
          <div className="flex-1 flex flex-col items-center justify-center py-4">
            <div className="relative w-36 h-36">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle cx="60" cy="60" r="54" fill="none" stroke={isDark ? '#2A2A2A' : '#F3F4F6'} strokeWidth="8" />
                <circle
                  cx="60" cy="60" r="54"
                  fill="none"
                  stroke={chartColor}
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 54}`}
                  strokeDashoffset={`${2 * Math.PI * 54 * (1 - (todayPaid / (todayTotal || 1)))}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{todayPaid}</span>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>of {todayTotal} Paid</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full mt-8">
              <div className={`p-3 rounded-2xl text-center ${isDark ? 'bg-emerald-500/10' : 'bg-green-50'}`}>
                <p className={`text-[10px] font-bold uppercase mb-1 ${isDark ? 'text-emerald-500/60' : 'text-green-600/60'}`}>Paid</p>
                <p className={`text-xl font-black ${isDark ? 'text-emerald-400' : 'text-green-700'}`}>{todayPaid}</p>
              </div>
              <div className={`p-3 rounded-2xl text-center ${isDark ? 'bg-red-500/10' : 'bg-red-50'}`}>
                <p className={`text-[10px] font-bold uppercase mb-1 ${isDark ? 'text-red-500/60' : 'text-red-600/60'}`}>Due</p>
                <p className={`text-xl font-black ${isDark ? 'text-accent-red' : 'text-red-600'}`}>{todayTotal - todayPaid}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>Recent Loans</h3>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Latest additions to your portfolio</p>
          </div>
          <button onClick={() => navigate('/loans')} className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${isDark ? 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            View All
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentLoans.map(loan => {
            const collected = Number(loan.totalCollected || 0);
            const dailyAmt = Number(loan.dailyAmount);
            const progress = loan.totalDays ? (Math.floor(collected / dailyAmt) / loan.totalDays) * 100 : 0;
            const typeColor = loan.loanType === 'Daily' ? 'text-yellow-400 bg-yellow-400/10' : loan.loanType === '15-Day' ? 'text-blue-400 bg-blue-400/10' : 'text-purple-400 bg-purple-400/10';
            
            return (
              <div key={loan.id} className={`p-4 rounded-2xl border transition-all hover:scale-[1.02] ${isDark ? 'bg-dark-muted/30 border-dark-border hover:bg-dark-muted/50' : 'bg-gray-50 border-gray-100 hover:bg-white hover:shadow-lg'}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${isDark ? 'bg-white/5 text-white' : 'bg-white shadow-sm text-primary-blue'}`}>
                    {loan.customerName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{loan.customerName}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${typeColor}`}>
                      {loan.loanType}
                    </span>
                  </div>
                  <p className={`text-sm font-black ${isDark ? 'text-emerald-400' : 'text-primary-blue'}`}>₹{loan.loanAmount.toLocaleString('en-IN')}</p>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider opacity-50">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-white/5' : 'bg-gray-200'}`}>
                    <div 
                      className={`h-full transition-all duration-1000 ${isDark ? 'bg-emerald-400' : 'bg-primary-blue'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
