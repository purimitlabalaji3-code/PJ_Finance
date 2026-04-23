import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Card from '../components/Card';
import { ArrowLeft, CheckCircle2, AlertCircle, Download, Clock } from 'lucide-react';
import { apiFetchLoanCollections } from '../utils/api';
import { exportSingleLoanPDF } from '../utils/exports';
import toast from 'react-hot-toast';

const LoanDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loans, collections, theme } = useApp();
  const isDark = theme === 'dark';

  const loan = loans.find(l => String(l.id) === id);

  const [history, setHistory] = useState([]);
  const [histLoading, setHistLoading] = useState(false);

  // Fetch real collection history for this loan
  useEffect(() => {
    if (!loan) return;
    setHistLoading(true);
    apiFetchLoanCollections(loan.id)
      .then(rows => {
        // Only show paid entries in the timeline
        const paid = rows
          .filter(r => r.status === 'Paid')
          .map((r, i) => ({
            day:       i + 1,
            date:      r.date ? new Date(r.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '—',
            paid:      Number(r.paid_amount),
            dueAmount: Number(r.due_amount),
            status:    r.status,
          }))
          .reverse(); // newest first
        setHistory(paid);
      })
      .catch(err => {
        console.error('Failed to load history:', err);
        toast.error('Could not load payment history');
      })
      .finally(() => setHistLoading(false));
  }, [loan]);

  if (!loan) return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <AlertCircle className={`w-12 h-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
      <p className={`text-lg font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Loan record not found</p>
      <button onClick={() => navigate('/loans')} className="text-primary-blue hover:underline">Go back to Loans</button>
    </div>
  );

  const totalAmt  = loan.totalAmount || (loan.loanAmount + (loan.loanAmount * loan.interest / 100));
  const totalPaid = history.reduce((s, h) => s + h.paid, 0);
  const pending   = Math.max(0, totalAmt - totalPaid);

  return (
    <div className="space-y-5 max-w-3xl mx-auto pb-20 sm:pb-0">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/loans')}
            className={`p-2 rounded-xl transition-colors ${isDark ? 'text-gray-400 hover:text-white hover:bg-dark-muted' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {loan.customerName}'s Loan
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${isDark ? 'bg-yellow-400/20 text-yellow-400' : 'bg-blue-100 text-blue-700'}`}>
                {loan.customerCode}
              </span>
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Started {loan.startDate}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            try {
              exportSingleLoanPDF(loan, collections);
              toast.success(`Statement for ${loan.customerName} downloaded ✅`);
            } catch (err) {
              console.error(err);
              toast.error('Failed to generate PDF');
            }
          }}
          className={`flex-shrink-0 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all active:scale-95 ${
            isDark ? 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20' : 'bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-100'
          }`}
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export PDF</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="flex flex-col justify-center">
          <p className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Principal</p>
          <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>₹{Number(loan.loanAmount).toLocaleString('en-IN')}</p>
        </Card>
        <Card className="flex flex-col justify-center">
          <p className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Payable</p>
          <p className={`text-lg font-bold ${isDark ? 'text-yellow-400' : 'text-primary-blue'}`}>₹{totalAmt.toLocaleString('en-IN')}</p>
        </Card>
        <Card className="flex flex-col justify-center">
          <p className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Collected</p>
          <p className={`text-lg font-bold ${isDark ? 'text-emerald-400' : 'text-green-600'}`}>₹{totalPaid.toLocaleString('en-IN')}</p>
        </Card>
        <Card className="flex flex-col justify-center">
          <p className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Remaining</p>
          <p className={`text-lg font-bold ${isDark ? 'text-accent-red' : 'text-red-500'}`}>₹{pending.toLocaleString('en-IN')}</p>
        </Card>
      </div>

      {/* Progress */}
      <Card>
        <div className="flex justify-between text-sm mb-2">
          <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Collection Progress</span>
          <span className={`font-bold ${isDark ? 'text-yellow-400' : 'text-primary-blue'}`}>{loan.paidDays} / {loan.totalDays} Days</span>
        </div>
        <div className={`h-3 rounded-full overflow-hidden ${isDark ? 'bg-dark-muted' : 'bg-gray-100'}`}>
          <div
            className={`h-3 rounded-full transition-all duration-700 ${isDark ? 'bg-yellow-400' : 'bg-primary-blue'}`}
            style={{ width: `${loan.totalDays ? (loan.paidDays / loan.totalDays) * 100 : 0}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs">
          <span className={isDark ? 'text-emerald-400' : 'text-green-600'}>Paid: ₹{totalPaid.toLocaleString('en-IN')}</span>
          <span className={isDark ? 'text-accent-red' : 'text-red-500'}>Remaining: ₹{pending.toLocaleString('en-IN')}</span>
        </div>
      </Card>

      {/* Timeline */}
      <Card>
        <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Daily Payment Timeline</h3>

        {histLoading ? (
          <div className="flex justify-center py-10">
            <span className={`w-8 h-8 border-4 border-t-transparent rounded-full animate-spin ${isDark ? 'border-yellow-400' : 'border-primary-blue'}`} />
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-8">
            <Clock className={`w-8 h-8 mx-auto mb-2 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No payments recorded yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                  isDark
                    ? 'border-dark-border bg-dark-card hover:border-yellow-400/30'
                    : 'border-light-border bg-white shadow-sm hover:border-blue-400/30'
                }`}
              >
                {/* Icon */}
                <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isDark ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-green-50 text-green-600 border border-green-100'
                }`}>
                  <CheckCircle2 className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>Day {item.day}</p>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{item.date}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Received</span>
                      <p className={`text-sm font-bold ${
                        item.paid > item.dueAmount
                          ? isDark ? 'text-emerald-300' : 'text-green-700'
                          : isDark ? 'text-emerald-400' : 'text-green-600'
                      }`}>
                        ₹{item.paid.toLocaleString('en-IN')}
                        {item.paid > item.dueAmount && (
                          <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-bold ${isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-green-100 text-green-700'}`}>
                            +₹{(item.paid - item.dueAmount).toLocaleString('en-IN')} extra
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Due</span>
                      <p className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>₹{item.dueAmount.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default LoanDetail;
