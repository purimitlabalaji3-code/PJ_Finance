import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { Plus, Trash2, TrendingUp, Calendar, IndianRupee, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const Loans = () => {
  const { loans, deleteLoan, customers, theme } = useApp();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleDelete = () => {
    deleteLoan(deleteTarget.id);
    toast.success('Loan deleted');
    setDeleteTarget(null);
  };

  const columns = [
    {
      header: 'Customer', key: 'customerName',
      render: row => (
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${isDark ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
            {row.customerName?.charAt(0)}
          </div>
          <span className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{row.customerName}</span>
        </div>
      )
    },
    {
      header: 'Loan Amount', key: 'loanAmount',
      render: row => <span className={`font-bold ${isDark ? 'text-yellow-400' : 'text-primary-blue'}`}>₹{Number(row.loanAmount).toLocaleString('en-IN')}</span>
    },
    {
      header: 'Interest', key: 'interest',
      render: row => <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{row.interest}%</span>
    },
    {
      header: 'Daily EMI', key: 'dailyAmount',
      render: row => {
        const loanAmount = Number(row.loanAmount);
        const interest = Number(row.interest);
        const total = loanAmount + (loanAmount * interest / 100);
        const daily = Math.ceil(total / 100);
        return <span className={`font-semibold text-sm ${isDark ? 'text-emerald-400' : 'text-green-600'}`}>₹{daily}/day</span>;
      }
    },
    {
      header: 'Progress', key: 'paidDays',
      render: row => {
        const pct = (row.paidDays / row.totalDays) * 100;
        return (
          <div className="flex items-center gap-2 min-w-[100px]">
            <div className={`flex-1 h-1.5 rounded-full ${isDark ? 'bg-dark-muted' : 'bg-gray-100'}`}>
              <div className={`h-1.5 rounded-full ${isDark ? 'bg-yellow-400' : 'bg-primary-blue'}`} style={{ width: `${pct}%` }} />
            </div>
            <span className={`text-xs flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{row.paidDays}d</span>
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
      header: 'Start Date', key: 'startDate',
      render: row => <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{row.startDate}</span>
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isDark ? 'bg-yellow-400/10 text-yellow-400' : 'bg-blue-50 text-primary-blue'}`}>
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Disbursed</p>
            <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>₹{totalDisbursed.toLocaleString('en-IN')}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-green-50 text-green-600'}`}>
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Active Loans</p>
            <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{activeCount}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isDark ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Avg. Days Paid</p>
            <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {loans.length ? Math.round(loans.reduce((s, l) => s + l.paidDays, 0) / loans.length) : 0}d
            </p>
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
