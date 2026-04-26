import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { Plus, Trash2, TrendingUp, Calendar, IndianRupee, Eye, Percent, Clock, Zap, CalendarDays, Check, X, Minus, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

const PaymentCalendarBar = ({ loan, allCollections, isDark }) => {
  if (loan.loanType !== 'Daily') return null;

  const totalDays = 100;
  const dots = [];
  let currentDate = new Date(loan.startDate);
  let daysAdded = 0;
  
  // Find all collections for this specific loan from the full history
  const loanCollections = allCollections.filter(c => c.loanId === loan.id);

  while (daysAdded < totalDays) {
    const isSunday = currentDate.getDay() === 0;
    // Normalize currentDate to YYYY-MM-DD in IST
    const dateStr = currentDate.toLocaleDateString('en-CA'); 
    
    // Normalize collection dates to YYYY-MM-DD in IST for matching
    const collection = loanCollections.find(c => {
       if (!c.date) return false;
       const cDate = new Date(c.date).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
       return cDate === dateStr;
    });
    
    let status = 'future'; // default
    if (isSunday) {
      status = 'sunday';
    } else if (collection) {
      status = (String(collection.status).toLowerCase() === 'paid') ? 'paid' : 'missed';
    } else if (new Date(dateStr) < new Date(new Date().toISOString().split('T')[0])) {
       // Past day but no collection record found (missed)
       status = 'missed';
    }

    dots.push({ 
      date: dateStr, 
      status, 
      label: currentDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      dayMonth: `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`
    });
    
    if (!isSunday) daysAdded++;
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Group dots by Month
  const months = [];
  dots.forEach(dot => {
    const d = new Date(dot.date);
    const monthYear = d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    let monthGroup = months.find(m => m.name === monthYear);
    if (!monthGroup) {
      monthGroup = { name: monthYear, dots: [] };
      months.push(monthGroup);
    }
    monthGroup.dots.push(dot);
  });

  return (
    <div className="mt-2 space-y-4">
      {months.map((month, mIdx) => (
        <div key={mIdx} className={`p-3 rounded-xl border ${isDark ? 'bg-dark-bg/50 border-dark-border/50' : 'bg-gray-50 border-gray-100'}`}>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className={`w-3.5 h-3.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {month.name}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {month.dots.map((dot, i) => (
              <div key={i} className="group relative flex flex-col items-center space-y-1">
                {/* Date Label Above Dot */}
                <span className={`text-[10px] font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {dot.dayMonth}
                </span>

                <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] transition-all duration-200 ${
                  dot.status === 'paid' ? 'bg-emerald-500 text-white shadow-sm' :
                  dot.status === 'missed' ? 'bg-red-500/20 text-red-500 border border-red-500/30' :
                  dot.status === 'sunday' ? 'bg-gray-500/10 text-gray-500' :
                  isDark ? 'bg-dark-muted text-gray-700' : 'bg-gray-100 text-gray-300'
                }`}>
                  {dot.status === 'paid' && <Check className="w-3.5 h-3.5 stroke-[4px]" />}
                  {dot.status === 'missed' && <X className="w-3.5 h-3.5 stroke-[4px]" />}
                  {dot.status === 'sunday' && <Minus className="w-3.5 h-3.5 opacity-30" />}
                </div>
                
                {/* Tooltip */}
                <div className={`absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 px-2 py-1 rounded text-[9px] font-bold whitespace-nowrap shadow-xl border ${
                  isDark ? 'bg-dark-bg border-dark-border text-white' : 'bg-white border-light-border text-gray-900'
                }`}>
                  {dot.label} {dot.status === 'sunday' ? '(Sunday)' : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const Loans = () => {
  const { loans, allCollections, deleteLoan, customers, theme } = useApp();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('type') || 'Daily';
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [expandedLoans, setExpandedLoans] = useState({}); // { loanId: boolean }

  const toggleExpand = (id) => {
    setExpandedLoans(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const tabs = [
    { id: 'Daily', label: 'Daily Collection', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { id: '15-Day', label: '15 Days Collection', icon: Clock, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { id: 'Monthly', label: 'Monthly Collection', icon: CalendarDays, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  ];

  const filteredLoans = useMemo(() => {
    return loans
      .filter(l => l.loanType === activeTab)
      .sort((a, b) => {
        const codeA = a.loanCode || '';
        const codeB = b.loanCode || '';
        // Smart numeric sort: PJ-D-001 < PJ-D-010
        return codeA.localeCompare(codeB, undefined, { numeric: true, sensitivity: 'base' });
      });
  }, [loans, activeTab]);

  const handleDelete = async () => {
    try {
      await deleteLoan(deleteTarget.id);
      toast.success('Loan deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete loan');
    } finally {
      setDeleteTarget(null);
    }
  };

  const columns = [
    {
      header: 'ID', key: 'loanCode',
      render: (row) => (
        <span className={`font-bold text-xs ${isDark ? 'text-yellow-400' : 'text-primary-blue'}`}>
          {row.loanCode || '—'}
        </span>
      )
    },
    {
      header: 'Customer', key: 'customerName',
      render: (row) => {
        const cust = customers.find(c => c.id === row.customerId);
        return (
          <div className="flex items-center gap-2.5">
            {cust?.image
              ? <img src={cust.image} alt={row.customerName} className="w-9 h-9 rounded-xl object-cover flex-shrink-0 border-2 border-dark-border" />
              : <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm ${isDark ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
                {row.customerName?.charAt(0).toUpperCase()}
              </div>
            }
            <div className="flex flex-col">
              <span className={`font-semibold text-sm truncate max-w-[120px] ${isDark ? 'text-white' : 'text-gray-900'}`}>{row.customerName}</span>
              <span className={`text-[11px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{cust?.customerCode || '—'}</span>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Loan Amount', key: 'loanAmount',
      render: row => {
        const principal = Number(row.loanAmount);
        const totalAmt = Number(row.totalAmount) || principal + (principal * Number(row.interest) / 100);
        const interestAmt = totalAmt - principal;
        return (
          <div className="space-y-0.5">
            <p className={`font-bold text-sm ${isDark ? 'text-yellow-400' : 'text-primary-blue'}`}>
              ₹{principal.toLocaleString('en-IN')}
            </p>
            <p className={`text-[11px] ${isDark ? 'text-pink-400' : 'text-pink-600'}`}>
              Interest: ₹{interestAmt.toLocaleString('en-IN')}
            </p>
            <p className={`text-[11px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Total: <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>₹{totalAmt.toLocaleString('en-IN')}</span>
            </p>
          </div>
        );
      }
    },
    {
      header: 'Interest', key: 'interest',
      render: row => (
        <span className={`font-semibold text-sm ${isDark ? 'text-pink-400' : 'text-pink-600'}`}>
          {row.interest}%
        </span>
      )
    },
    {
      header: activeTab === 'Daily' ? 'Daily EMI' : 'Installment', key: 'dailyAmount',
      render: row => {
        const amt = row.dailyAmount;
        const suffix = row.loanType === 'Daily' ? '/day' : row.loanType === '15-Day' ? '/15d' : '/mo';
        return <span className={`font-semibold text-sm ${isDark ? 'text-emerald-400' : 'text-green-600'}`}>₹{amt}{suffix}</span>;
      }
    },
    {
      header: 'Progress', key: 'paidDays',
      render: row => {
        const collected = Number(row.totalCollected || 0);
        const dailyAmt = Number(row.dailyAmount);
        const calcPaidDays = dailyAmt > 0 ? Math.floor(collected / dailyAmt) : row.paidDays;
        const totalUnits = row.loanType === 'Daily' ? (row.totalDays || 100) : '—';
        const pct = row.totalDays ? (calcPaidDays / row.totalDays) * 100 : 0;
        
        return (
          <div className="space-y-1 min-w-[110px]">
            <div className="flex items-center gap-2">
              {row.loanType === 'Daily' && (
                <div className={`flex-1 h-1.5 rounded-full ${isDark ? 'bg-dark-muted' : 'bg-gray-100'}`}>
                  <div className={`h-1.5 rounded-full ${isDark ? 'bg-yellow-400' : 'bg-primary-blue'}`} style={{ width: `${pct}%` }} />
                </div>
              )}
              <span className={`text-xs flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {calcPaidDays} {row.loanType === 'Daily' ? ` / ${row.totalDays}d` : 'units'}
              </span>
            </div>
            <p className={`text-[11px] font-semibold ${isDark ? 'text-emerald-400' : 'text-green-600'}`}>
              ₹{collected.toLocaleString('en-IN')} collected
            </p>
          </div>
        );
      }
    },
    {
      header: 'Remaining', key: 'remaining',
      render: row => {
        const total = Number(row.totalAmount) || Number(row.loanAmount) * (1 + Number(row.interest) / 100);
        const collected = Number(row.totalCollected || 0);
        const remaining = Math.max(total - collected, 0);
        const isPaid = remaining <= 0;
        return (
          <div className="space-y-0.5">
            <p className={`font-bold text-sm ${
              isPaid
                ? isDark ? 'text-emerald-400' : 'text-green-600'
                : isDark ? 'text-orange-400' : 'text-orange-600'
            }`}>
              {isPaid ? '✓ Cleared' : `₹${remaining.toLocaleString('en-IN')}`}
            </p>
            {!isPaid && (
              <p className={`text-[11px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                of ₹{total.toLocaleString('en-IN')}
              </p>
            )}
          </div>
        );
      }
    },
    {
      header: 'Status', key: 'status',
      render: row => (
        <span className={`badge ${row.status === 'Active'
          ? isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-green-100 text-green-700'
          : isDark ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-100 text-gray-500'
          }`}>{row.status}</span>
      )
    },
    {
      header: 'Actions', key: 'actions',
      render: row => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => toggleExpand(row.id)}
            className={`p-1.5 rounded-lg transition-colors ${
              expandedLoans[row.id]
                ? isDark ? 'bg-primary-blue/20 text-primary-blue' : 'bg-blue-100 text-primary-blue'
                : isDark ? 'text-gray-400 hover:text-primary-blue hover:bg-primary-blue/10' : 'text-gray-500 hover:text-primary-blue hover:bg-blue-50'
            }`}
            title={expandedLoans[row.id] ? "Collapse History" : "View Payment History"}
          >
            {expandedLoans[row.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={() => navigate(`/loans/${row.id}`)}
            className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-gray-400 hover:text-blue-400 hover:bg-blue-400/10' : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'}`}
            title="View Details"
          ><Eye className="w-4 h-4" /></button>
          <button
            onClick={() => setDeleteTarget(row)}
            className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-gray-400 hover:text-accent-red hover:bg-red-500/10' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'}`}
            title="Delete"
          ><Trash2 className="w-4 h-4" /></button>
        </div>
      )
    },
  ];

  // Summary stats based on filtered loans
  const totalDisbursed = filteredLoans.reduce((s, l) => s + Number(l.loanAmount), 0);
  const totalInterest = filteredLoans.reduce((s, l) => {
    const total = Number(l.totalAmount) || Number(l.loanAmount) * (1 + Number(l.interest) / 100);
    return s + (total - Number(l.loanAmount));
  }, 0);
  const totalPayable = filteredLoans.reduce((s, l) => {
    return s + (Number(l.totalAmount) || Number(l.loanAmount) * (1 + Number(l.interest) / 100));
  }, 0);
  const totalRemaining = filteredLoans.reduce((s, l) => {
    const total = Number(l.totalAmount) || Number(l.loanAmount) * (1 + Number(l.interest) / 100);
    const collected = Number(l.totalCollected || 0);
    return s + Math.max(total - collected, 0);
  }, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Loan Management</h2>
          <p className={`text-sm mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Track and manage your collection cycles</p>
        </div>
        <Button icon={Plus} onClick={() => navigate('/loans/add')}>Add New Loan</Button>
      </div>

      {/* Modern Tab System — Horizontal Scroll for Mobile */}
      <div className="overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className={`p-1 rounded-2xl flex gap-1 min-w-[340px] sm:min-w-0 ${isDark ? 'bg-dark-muted' : 'bg-gray-100'}`}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSearchParams({ type: tab.id })}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 sm:py-2.5 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? isDark ? 'bg-dark-bg text-white shadow-xl' : 'bg-white text-primary-blue shadow-md'
                    : isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? tab.color : 'opacity-50'}`} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.id}</span>
                <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[9px] ${
                  isActive 
                    ? isDark ? 'bg-white/10 text-white' : 'bg-primary-blue/10 text-primary-blue'
                    : isDark ? 'bg-white/5 text-gray-500' : 'bg-gray-200 text-gray-600'
                }`}>
                  {loans.filter(l => l.loanType === tab.id).length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="flex items-center gap-3 relative overflow-hidden group">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 duration-300 ${isDark ? 'bg-yellow-400/10 text-yellow-400' : 'bg-blue-50 text-primary-blue'}`}>
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <p className={`text-[11px] font-medium uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Disbursed</p>
            <p className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>₹{totalDisbursed.toLocaleString('en-IN')}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 relative overflow-hidden group">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 duration-300 ${isDark ? 'bg-pink-500/10 text-pink-400' : 'bg-pink-50 text-pink-600'}`}>
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <p className={`text-[11px] font-medium uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Interest</p>
            <p className={`text-base font-bold ${isDark ? 'text-pink-400' : 'text-pink-600'}`}>₹{Math.round(totalInterest).toLocaleString('en-IN')}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 relative overflow-hidden group">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 duration-300 ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-green-50 text-green-600'}`}>
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className={`text-[11px] font-medium uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Payable</p>
            <p className={`text-base font-bold ${isDark ? 'text-emerald-400' : 'text-green-600'}`}>₹{Math.round(totalPayable).toLocaleString('en-IN')}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 relative overflow-hidden group">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 duration-300 ${isDark ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-50 text-orange-600'}`}>
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className={`text-[11px] font-medium uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Remaining</p>
            <p className={`text-base font-bold ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>₹{Math.round(totalRemaining).toLocaleString('en-IN')}</p>
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card className="!p-0 overflow-hidden border-none shadow-xl">
        <Table 
          columns={columns} 
          data={filteredLoans} 
          emptyMessage={`No ${activeTab} loans found. Add one to get started!`} 
          renderSubRow={(row) => (
            expandedLoans[row.id] && <PaymentCalendarBar loan={row} allCollections={allCollections} isDark={isDark} />
          )}
        />
      </Card>

      {/* Delete Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Loan"
        size="sm"
        footer={<>
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </>}
      >
        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Delete loan for <strong>{deleteTarget?.customerName}</strong> of <strong>₹{Number(deleteTarget?.loanAmount || 0).toLocaleString('en-IN')}</strong>? This cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default Loans;
