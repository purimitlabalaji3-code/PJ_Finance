import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Card from '../components/Card';
import { ArrowLeft, CheckCircle2, AlertCircle, Download } from 'lucide-react';
import toast from 'react-hot-toast';

const LoanDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loans, theme } = useApp();
  const isDark = theme === 'dark';
  
  const loan = loans.find(l => String(l.id) === id);
  
  const history = useMemo(() => {
    if (!loan) return [];
    const arr = [];
    
    // Handle mock data missing totalAmount vs app context generated ones
    const totalAmt = loan.totalAmount || (loan.loanAmount + (loan.loanAmount * loan.interest / 100));
    const dailyAmt = loan.dailyAmount || Math.ceil(totalAmt / loan.totalDays);
    
    let pending = totalAmt;
    
    // Generate simulated timeline history starting from startDate
    const startDate = new Date(loan.startDate);
    for (let i = 0; i < loan.paidDays; i++) {
        pending -= dailyAmt;
        const pDate = new Date(startDate);
        pDate.setDate(pDate.getDate() + i + 1); // Payment happens days after start
        arr.push({
            day: i + 1,
            date: pDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
            paid: dailyAmt,
            pending: Math.max(0, pending)
        });
    }
    return arr.reverse(); // Show newest collections at the top
  }, [loan]);

  if (!loan) return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <AlertCircle className={`w-12 h-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
      <p className={`text-lg font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Loan record not found</p>
      <button onClick={() => navigate('/loans')} className="text-primary-blue hover:underline">Go back to Loans</button>
    </div>
  );

  const totalAmt = loan.totalAmount || (loan.loanAmount + (loan.loanAmount * loan.interest / 100));

  return (
    <div className="space-y-5 max-w-3xl mx-auto pb-20 sm:pb-0">
      {/* Header Navigation */}
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
                PJ-{String(loan.id).slice(-4)}
              </span>
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Started {loan.startDate}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => toast.success(`Generating PDF for ${loan.customerName}... 📥`, { duration: 2500 })}
          className={`flex-shrink-0 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all active:scale-95 ${
            isDark ? 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20' : 'bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-100'
          }`}
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export PDF</span>
        </button>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="flex flex-col justify-center">
           <p className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Receivable Amount</p>
           <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>₹{totalAmt.toLocaleString('en-IN')}</p>
        </Card>
        <Card className="flex flex-col justify-center">
           <p className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Collection Progress</p>
           <p className={`text-xl font-bold ${isDark ? 'text-emerald-400' : 'text-green-600'}`}>{loan.paidDays} / {loan.totalDays} Days</p>
        </Card>
      </div>

      {/* Timeline Section */}
      <Card>
         <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Daily Payment Timeline</h3>
         {history.length === 0 ? (
             <div className="text-center py-8">
               <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No daily payments recorded yet.</p>
             </div>
         ) : (
             <div className="space-y-4">
                 {history.map((item) => (
                     <div key={item.day} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all hover:scale-[1.01] ${isDark ? 'border-dark-border bg-dark-card hover:border-yellow-400/30' : 'border-light-border bg-white shadow-sm hover:border-blue-400/30'}`}>
                         
                         {/* Circle Icon */}
                         <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                            <CheckCircle2 className="w-5 h-5" />
                         </div>
                         
                         {/* Text Content */}
                         <div className="flex-1 min-w-0">
                             <div className="flex justify-between items-end mb-1">
                                <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>Day {item.day}</p>
                                <p className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{item.date}</p>
                             </div>
                             <div className="flex justify-between items-center bg-opacity-50 mt-2">
                                <div className="flex flex-col">
                                  <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Received</span>
                                  <span className={`text-sm font-bold ${isDark ? 'text-emerald-400' : 'text-green-600'}`}>₹{item.paid.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex flex-col items-end">
                                  <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Pending</span>
                                  <span className={`text-sm font-bold ${isDark ? 'text-accent-red' : 'text-red-500'}`}>₹{item.pending.toLocaleString('en-IN')}</span>
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
