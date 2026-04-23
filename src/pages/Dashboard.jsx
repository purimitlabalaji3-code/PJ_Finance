import React from 'react';
import { useApp } from '../context/AppContext';
import Card from '../components/Card';
import {
  Users, CreditCard, TrendingUp, AlertCircle,
  ArrowUpRight, ArrowDownRight, IndianRupee,
  Wallet, Target, Percent
} from 'lucide-react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { weeklyData } from '../utils/mockData';

const StatCard = ({ title, value, icon: Icon, change, changeType, color, prefix }) => {
  const { theme } = useApp();
  const isDark = theme === 'dark';
  const isPositive = changeType === 'up';

  return (
    <Card className={`
      group relative overflow-hidden transition-all duration-500 hover:-translate-y-1 cursor-default px-6 py-6
      ${isDark ? 'hover:bg-white/5' : 'hover:bg-white shadow-lg shadow-blue-500/5'}
    `}>
      {/* Decorative accent */}
      <div className={`absolute top-0 right-0 w-16 h-16 opacity-[0.03] transition-all duration-500 group-hover:scale-150 ${color}`} style={{ borderRadius: '0 0 0 100%' }} />
      
      <div className="flex items-start justify-between mb-6 relative z-10">
        <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center flex-shrink-0 transition-transform duration-500 group-hover:rotate-6 ${color} shadow-lg shadow-current/10`}>
          <Icon className="w-7 h-7" />
        </div>
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
      </div>
      
      <div className="relative z-10">
        <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-50 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {title}
        </p>
        <p className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
          <span className="text-sm font-bold opacity-30 mr-1">{prefix}</span>
          {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
        </p>
      </div>
    </Card>
  );
};

const Dashboard = () => {
  const { stats, loans, collections, theme } = useApp();
  const isDark = theme === 'dark';

  const chartColor = isDark ? '#FFD700' : '#2563EB';
  const chartBg = isDark ? '#1A1A1A' : '#FFFFFF';
  const textColor = isDark ? '#9CA3AF' : '#6B7280';
  const gridColor = isDark ? '#2A2A2A' : '#F3F4F6';

  const recentLoans = loans.slice(0, 5);
  const todayPaid = collections.filter(c => c.status === 'Paid').length;
  const todayTotal = collections.length;

  const totalDisbursed = loans.reduce((s, l) => s + Number(l.loanAmount), 0);

  // Total interest = sum of (totalAmount - loanAmount) across all loans
  const totalInterest = loans.reduce((s, l) => {
    const interest = Number(l.totalAmount) - Number(l.loanAmount);
    return s + (interest > 0 ? interest : 0);
  }, 0);

  // Today's interest collected = interest portion from each paid collection
  const todayInterestCollected = collections
    .filter(c => c.status === 'Paid')
    .reduce((s, c) => {
      const loan = loans.find(l => l.id === c.loanId);
      if (!loan || !loan.interest) return s;
      const intRate = Number(loan.interest);
      const interestPerDay = Number(loan.dailyAmount) * (intRate / (100 + intRate));
      return s + interestPerDay;
    }, 0);

  const expectedDaily = loans.filter(l => l.status === 'Active').reduce((s, l) => {
    const loanAmt = Number(l.loanAmount);
    const intRate = Number(l.interest);
    const total = loanAmt + (loanAmt * intRate / 100);
    const daily = l.dailyAmount || Math.ceil(total / l.totalDays);
    return s + daily;
  }, 0);

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
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers}
          icon={Users}
          change="Registered"
          changeType="up"
          color={isDark ? 'bg-yellow-400/10 text-yellow-400' : 'bg-blue-50 text-primary-blue'}
        />
        <StatCard
          title="Total Loan Given"
          value={totalDisbursed}
          icon={CreditCard}
          change="Principal"
          changeType="up"
          prefix="₹"
          color={isDark ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600'}
        />
        <StatCard
          title="Total Collected"
          value={collections.filter(c => c.status === 'Paid').reduce((s, c) => s + Number(c.paidAmount), 0)}
          icon={IndianRupee}
          change="All time"
          changeType="up"
          prefix="₹"
          color={isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-green-50 text-green-600'}
        />
        <StatCard
          title="Total Interest"
          value={Math.round(totalInterest)}
          icon={Percent}
          change="Earned"
          changeType="up"
          prefix="₹"
          color={isDark ? 'bg-pink-500/10 text-pink-400' : 'bg-pink-50 text-pink-600'}
        />
        <StatCard
          title="Today Collected"
          value={stats.todayCollection}
          icon={TrendingUp}
          change="Received"
          changeType="up"
          prefix="₹"
          color={isDark ? 'bg-cyan-500/10 text-cyan-400' : 'bg-cyan-50 text-cyan-600'}
        />
        <StatCard
          title="Today Target"
          value={expectedDaily}
          icon={Target}
          change="To collect"
          changeType="up"
          prefix="₹"
          color={isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}
        />
        <StatCard
          title="Today Pending"
          value={stats.pendingAmount}
          icon={AlertCircle}
          change="Due now"
          changeType="down"
          prefix="₹"
          color={isDark ? 'bg-red-500/10 text-accent-red' : 'bg-red-50 text-red-500'}
        />
        <StatCard
          title="Remaining Bal."
          value={Math.round(totalDisbursed + totalInterest - collections.filter(c => c.status === 'Paid').reduce((s, c) => s + Number(c.paidAmount), 0))}
          icon={Wallet}
          change="In market"
          changeType="up"
          prefix="₹"
          color={isDark ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-50 text-orange-600'}
        />
      </div>

      {/* Weekly Bar */}
      <Card>
        <div className="mb-5">
          <h3 className={`font-bold text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>This Week</h3>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Daily collections</p>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={weeklyData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke={gridColor} />
            <XAxis dataKey="day" tick={{ fill: textColor, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: textColor, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(1)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="amount" fill={chartColor} radius={[6, 6, 0, 0]} name="Amount" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Loans */}
        <Card className="lg:col-span-2">
          <h3 className={`font-bold text-base mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Recent Loans</h3>
          <div className={`divide-y ${isDark ? 'divide-dark-border' : 'divide-light-border'}`}>
            {recentLoans.map(loan => {
              const progress = (loan.paidDays / loan.totalDays) * 100;
              return (
                <div key={loan.id} className="py-3 flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-yellow-400/10 text-yellow-400' : 'bg-blue-50 text-primary-blue'}`}>
                    <span className="font-bold text-xs">{loan.customerName.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <p className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{loan.customerName}</p>
                      <span className={`text-xs font-bold ml-2 ${isDark ? 'text-yellow-400' : 'text-primary-blue'}`}>₹{(loan.loanAmount).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`flex-1 h-1.5 rounded-full ${isDark ? 'bg-dark-muted' : 'bg-gray-100'}`}>
                        <div
                          className={`h-1.5 rounded-full transition-all ${isDark ? 'bg-yellow-400' : 'bg-primary-blue'}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className={`text-xs flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{loan.paidDays}/{loan.totalDays}d</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Today status */}
        <Card>
          <h3 className={`font-bold text-base mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Today's Status</h3>
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative w-28 h-28">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle cx="60" cy="60" r="50" fill="none" stroke={isDark ? '#2A2A2A' : '#F3F4F6'} strokeWidth="10" />
                <circle
                  cx="60" cy="60" r="50"
                  fill="none"
                  stroke={isDark ? '#10B981' : '#10B981'}
                  strokeWidth="10"
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  strokeDashoffset={`${2 * Math.PI * 50 * (1 - todayPaid / todayTotal)}`}
                  strokeLinecap="round"
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{todayPaid}</span>
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>of {todayTotal}</span>
              </div>
            </div>
            <p className={`mt-3 text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Collected Today</p>
          </div>
          <div className="space-y-2 mt-2">
            <div className={`flex justify-between items-center p-2.5 rounded-xl ${isDark ? 'bg-emerald-500/10' : 'bg-green-50'}`}>
              <span className={`text-xs font-medium ${isDark ? 'text-emerald-400' : 'text-green-700'}`}>✅ Paid</span>
              <span className={`text-xs font-bold ${isDark ? 'text-emerald-400' : 'text-green-700'}`}>{todayPaid}</span>
            </div>
            <div className={`flex justify-between items-center p-2.5 rounded-xl ${isDark ? 'bg-red-500/10' : 'bg-red-50'}`}>
              <span className={`text-xs font-medium ${isDark ? 'text-accent-red' : 'text-red-600'}`}>⏳ Pending</span>
              <span className={`text-xs font-bold ${isDark ? 'text-accent-red' : 'text-red-600'}`}>{todayTotal - todayPaid}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
