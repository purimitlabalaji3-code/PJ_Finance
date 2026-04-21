import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { Plus, Trash2, TrendingUp, Calendar, IndianRupee, Eye, Percent } from 'lucide-react';
import toast from 'react-hot-toast';

const Loans = () => {
  const { loans, deleteLoan, collections, customers, theme } = useApp();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [deleteTarget, setDeleteTarget] = useState(null);

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
            <span className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{row.customerName}</span>
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
            <p className={`text-[11px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Total: <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>₹{totalAmt.toLocaleString('en-IN')}</span>
            </p>
            <p className={`text-[11px] ${isDark ? 'text-pink-400' : 'text-pink-600'}`}>
              Interest: ₹{interestAmt.toLocaleString('en-IN')}
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
      header: 'Daily EMI', key: 'dailyAmount',
      render: row => {
        const daily = row.dailyAmount || Math.ceil(
          (Number(row.loanAmount) * (1 + Number(row.interest) / 100)) / 100
        );
        return <span className={`font-semibold text-sm ${isDark ? 'text-emerald-400' : 'text-green-600'}`}>₹{daily}/day</span>;
      }
    },
    {
      header: 'Progress', key: 'paidDays',
      render: row => {
        const pct = row.totalDays ? (row.paidDays / row.totalDays) * 100 : 0;
        return (
          <div className="space-y-1 min-w-[110px]">
            <div className="flex items-center gap-2">
              <div className={`flex-1 h-1.5 rounded-full ${isDark ? 'bg-dark-muted' : 'bg-gray-100'}`}>
                <div className={`h-1.5 rounded-full ${isDark ? 'bg-yellow-400' : 'bg-primary-blue'}`} style={{ width: `${pct}%` }} />
              </div>
              <span className={`text-xs flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{row.paidDays}d</span>
            </div>
            <p className={`text-[11px] font-semibold ${isDark ? 'text-emerald-400' : 'text-green-600'}`}>
              ₹{(row.totalCollected || 0).toLocaleString('en-IN')} collected
            </p>
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
      header: 'Dates', key: 'startDate',
      render: row => {
        // Calculate end date skipping Sundays
        let endDate = '—';
        if (row.startDate && row.totalDays) {
          const d = new Date(row.startDate);
          let t = row.totalDays;
          if (d.getDay() === 0) d.setDate(d.getDate() + 1); // Skip if start is Sunday
          t--;
          while (t > 0) {
            d.setDate(d.getDate() + 1);
            if (d.getDay() !== 0) t--;
          }
          endDate = d.toISOString().split('T')[0];
        }

        return (
          <div className={`text-xs space-y-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <p><span className={isDark ? 'text-gray-500' : 'text-gray-400'}>Start:</span> {row.startDate}</p>
            <p><span className={isDark ? 'text-gray-500' : 'text-gray-400'}>End:</span> <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{endDate}</span></p>
          </div>
        );
      }
    },
    {
      header: 'Actions', key: 'actions',
      render: row => (
        <div className="flex items-center gap-1.5">
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

  // Summary stats
  const totalDisbursed = loans.reduce((s, l) => s + Number(l.loanAmount), 0);
  const totalInterest = loans.reduce((s, l) => {
    const total = Number(l.totalAmount) || Number(l.loanAmount) * (1 + Number(l.interest) / 100);
    return s + (total - Number(l.loanAmount));
  }, 0);
  const totalPayable = loans.reduce((s, l) => {
    return s + (Number(l.totalAmount) || Number(l.loanAmount) * (1 + Number(l.interest) / 100));
  }, 0);
  const activeCount = loans.filter(l => l.status === 'Active').length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Loan Management</h2>
          <p className={`text-sm mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{loans.length} total loans</p>
        </div>
        <Button icon={Plus} onClick={() => navigate('/loans/add')}>Add Loan</Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-yellow-400/10 text-yellow-400' : 'bg-blue-50 text-primary-blue'}`}>
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Disbursed</p>
            <p className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>₹{totalDisbursed.toLocaleString('en-IN')}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-pink-500/10 text-pink-400' : 'bg-pink-50 text-pink-600'}`}>
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Interest</p>
            <p className={`text-base font-bold ${isDark ? 'text-pink-400' : 'text-pink-600'}`}>₹{Math.round(totalInterest).toLocaleString('en-IN')}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-green-50 text-green-600'}`}>
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Payable</p>
            <p className={`text-base font-bold ${isDark ? 'text-emerald-400' : 'text-green-600'}`}>₹{Math.round(totalPayable).toLocaleString('en-IN')}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Active Loans</p>
            <p className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{activeCount}</p>
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card className="!p-0 overflow-hidden">
        <Table columns={columns} data={loans} emptyMessage="No loans found. Add a loan to get started!" />
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
