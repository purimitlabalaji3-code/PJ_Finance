import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Card from '../components/Card';
import {
  Users, BarChart2, Calendar, FileBarChart,
  Percent, IndianRupee, TrendingUp, CheckCircle2, FileText,
  Download, FileSpreadsheet
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  exportCustomersCSV, exportCustomersPDF,
  exportLoansCSV,     exportLoansPDF,
  exportCollectionCSV, exportCollectionPDF,
  exportSummaryCSV,   exportSummaryPDF,
  dateRanges,
} from '../utils/exports';

// ── Single report row with CSV + PDF ─────────────────────────────────────
const ReportRow = ({ label, icon: Icon, variant, onCSV, onPDF, isDark }) => {
  const colors = {
    primary: isDark
      ? { bg: 'bg-yellow-400/10', text: 'text-yellow-400', border: 'border-yellow-400/20' }
      : { bg: 'bg-blue-50',       text: 'text-primary-blue', border: 'border-blue-100' },
    success: isDark
      ? { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' }
      : { bg: 'bg-green-50',       text: 'text-green-700',    border: 'border-green-100' },
    warning: isDark
      ? { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' }
      : { bg: 'bg-orange-50',     text: 'text-orange-600',  border: 'border-orange-100' },
    purple: isDark
      ? { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' }
      : { bg: 'bg-purple-50',     text: 'text-purple-600',  border: 'border-purple-100' },
  };
  const c = colors[variant] || colors.primary;
  return (
    <div className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${isDark ? 'border-dark-border hover:border-yellow-400/20' : 'border-light-border hover:border-blue-200'}`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${c.bg} ${c.border} border`}>
        <Icon className={`w-4 h-4 ${c.text}`} />
      </div>
      <span className={`flex-1 text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{label}</span>
      {/* CSV Button */}
      <button
        onClick={onCSV}
        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all active:scale-95 ${
          isDark ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
                 : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'}`}
      >
        <FileSpreadsheet className="w-3.5 h-3.5" />CSV
      </button>
      {/* PDF Button */}
      <button
        onClick={onPDF}
        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all active:scale-95 ${
          isDark ? 'bg-red-500/10 text-accent-red hover:bg-red-500/20 border border-red-500/20'
                 : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'}`}
      >
        <Download className="w-3.5 h-3.5" />PDF
      </button>
    </div>
  );
};

const SectionCard = ({ title, description, icon: Icon, isDark, children }) => (
  <Card>
    <div className="flex items-start gap-3 mb-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-yellow-400/10 text-yellow-400' : 'bg-blue-50 text-primary-blue'}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h3 className={`font-bold text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
        <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{description}</p>
      </div>
    </div>
    <div className="space-y-2.5">{children}</div>
  </Card>
);

const Reports = () => {
  const { theme, customers, loans, collections, loadAll } = useApp();
  const isDark = theme === 'dark';

  // ── Auto-refresh: poll every 30s + refresh when tab becomes visible ──
  useEffect(() => {
    loadAll(); // fresh load on mount

    const interval = setInterval(loadAll, 30000); // every 30 seconds

    const onVisible = () => {
      if (document.visibilityState === 'visible') loadAll();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  // ── Live stats ─────────────────────────────────────────────────────────
  const totalCollected = collections.filter(c => c.status === 'Paid').reduce((s, c) => s + Number(c.paidAmount), 0);
  const totalPending   = collections.filter(c => c.status === 'Pending').reduce((s, c) => s + Number(c.dueAmount), 0);
  const totalDisbursed = loans.reduce((s, l) => s + Number(l.loanAmount), 0);
  const totalInterest  = loans.reduce((s, l) => {
    const tot = Number(l.totalAmount) || Number(l.loanAmount) * (1 + Number(l.interest) / 100);
    return s + (tot - Number(l.loanAmount));
  }, 0);
  const totalPayable   = totalDisbursed + totalInterest;
  const activeLoans    = loans.filter(l => l.status === 'Active').length;
  const paidToday      = collections.filter(c => c.status === 'Paid').length;

  // ── Date-filtered collections helper ───────────────────────────────────
  const filterByRange = (range) => {
    const { from, to } = dateRanges[range]();
    return collections.filter(c => {
      const d = (c.date || '').split('T')[0];
      return d >= from && d <= to;
    });
  };

  // ── Run with toast ─────────────────────────────────────────────────────
  const run = (fn, label) => {
    try { fn(); toast.success(`${label} downloaded ✅`); }
    catch (e) { console.error(e); toast.error(`Failed: ${label}`); }
  };

  // ── Filtered loans by start date ───────────────────────────────────────
  const filterLoansByRange = (range) => {
    const { from, to } = dateRanges[range]();
    return loans.filter(l => {
      const d = (l.startDate || '').split('T')[0];
      return d >= from && d <= to;
    });
  };

  return (
    <div className="space-y-5 pb-20 sm:pb-0">
      {/* Header */}
      <div>
        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Reports</h2>
        <p className={`text-sm mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Download reports as <span className={`font-semibold ${isDark ? 'text-emerald-400' : 'text-green-600'}`}>CSV</span> or <span className={`font-semibold ${isDark ? 'text-accent-red' : 'text-red-600'}`}>PDF</span></p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Customers', value: customers.length,                                          icon: Users,        color: isDark ? 'text-yellow-400' : 'text-primary-blue' },
          { label: 'Active Loans',    value: activeLoans,                                                icon: BarChart2,    color: isDark ? 'text-purple-400'  : 'text-purple-600'  },
          { label: 'Total Disbursed', value: `₹${totalDisbursed.toLocaleString('en-IN')}`,              icon: IndianRupee,  color: isDark ? 'text-orange-400'  : 'text-orange-600'  },
          { label: 'Total Interest',  value: `₹${Math.round(totalInterest).toLocaleString('en-IN')}`,   icon: Percent,      color: isDark ? 'text-pink-400'    : 'text-pink-600'    },
          { label: 'Total Payable',   value: `₹${Math.round(totalPayable).toLocaleString('en-IN')}`,    icon: TrendingUp,   color: isDark ? 'text-emerald-400' : 'text-green-600'   },
          { label: 'Collected Today', value: `₹${totalCollected.toLocaleString('en-IN')}`,              icon: CheckCircle2, color: isDark ? 'text-emerald-400' : 'text-green-600'   },
          { label: 'Pending Today',   value: `₹${totalPending.toLocaleString('en-IN')}`,                icon: FileText,     color: isDark ? 'text-accent-red'  : 'text-red-500'     },
          { label: 'Paid Today',      value: `${paidToday} / ${collections.length}`,                    icon: Calendar,     color: isDark ? 'text-cyan-400'    : 'text-cyan-600'    },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-dark-muted' : 'bg-gray-50'}`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div className="min-w-0">
              <p className={`text-sm font-bold truncate ${color}`}>{value}</p>
              <p className={`text-[11px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Report Sections — original structure restored */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* ── Customer Reports ── */}
        <SectionCard title="Customer Reports" description="Individual customer collection history" icon={Users} isDark={isDark}>
          <ReportRow label="Daily Customer Report"    icon={FileText}     variant="primary" isDark={isDark}
            onCSV={() => run(() => exportCustomersCSV(customers), 'Daily Customer CSV')}
            onPDF={() => run(() => exportCustomersPDF(customers), 'Daily Customer PDF')}
          />
          <ReportRow label="Weekly Customer Report"   icon={Calendar}     variant="success" isDark={isDark}
            onCSV={() => run(() => exportCustomersCSV(customers), 'Weekly Customer CSV')}
            onPDF={() => run(() => exportCustomersPDF(customers), 'Weekly Customer PDF')}
          />
          <ReportRow label="Monthly Customer Report"  icon={BarChart2}    variant="warning" isDark={isDark}
            onCSV={() => run(() => exportCustomersCSV(customers), 'Monthly Customer CSV')}
            onPDF={() => run(() => exportCustomersPDF(customers), 'Monthly Customer PDF')}
          />
          <ReportRow label="100-Days Customer PDF"    icon={FileBarChart}  variant="purple" isDark={isDark}
            onCSV={() => run(() => exportLoansCSV(loans), '100-Day Loan CSV')}
            onPDF={() => run(() => exportLoansPDF(loans), '100-Day Loan PDF')}
          />
        </SectionCard>

        {/* ── Overall Reports ── */}
        <SectionCard title="Overall Reports" description="Business-wide collection summaries" icon={BarChart2} isDark={isDark}>
          <ReportRow label="Daily Overall Report"     icon={FileText}     variant="primary" isDark={isDark}
            onCSV={() => run(() => exportCollectionCSV(filterByRange('daily')), 'Daily Collection CSV')}
            onPDF={() => run(() => exportCollectionPDF(filterByRange('daily')), 'Daily Collection PDF')}
          />
          <ReportRow label="Weekly Overall Report"    icon={Calendar}     variant="success" isDark={isDark}
            onCSV={() => run(() => exportCollectionCSV(filterByRange('weekly')), 'Weekly Collection CSV')}
            onPDF={() => run(() => exportCollectionPDF(filterByRange('weekly')), 'Weekly Collection PDF')}
          />
          <ReportRow label="Monthly Overall Report"   icon={BarChart2}    variant="warning" isDark={isDark}
            onCSV={() => run(() => exportCollectionCSV(filterByRange('monthly')), 'Monthly Collection CSV')}
            onPDF={() => run(() => exportCollectionPDF(filterByRange('monthly')), 'Monthly Collection PDF')}
          />
          <ReportRow label="Business Summary PDF"     icon={FileBarChart}  variant="purple" isDark={isDark}
            onCSV={() => run(() => exportSummaryCSV({
              'Total Customers': customers.length, 'Active Loans': activeLoans,
              'Total Disbursed': `Rs.${totalDisbursed}`, 'Total Interest': `Rs.${Math.round(totalInterest)}`,
              'Total Payable': `Rs.${Math.round(totalPayable)}`, 'Collected Today': `Rs.${totalCollected}`,
              'Pending Today': `Rs.${totalPending}`, 'Paid Today': `${paidToday}/${collections.length}`,
            }), 'Summary CSV')}
            onPDF={() => run(() => exportSummaryPDF({ customers, loans, collections }), 'Business Summary PDF')}
          />
        </SectionCard>
      </div>

      {/* Footer note */}
      <Card className={`border-dashed ${isDark ? 'border-dark-border' : 'border-light-border'}`}>
        <div className={`flex items-start gap-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          <FileText className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <p>
            <span className={`font-semibold ${isDark ? 'text-emerald-400' : 'text-green-600'}`}>CSV</span> opens in Excel or Google Sheets. &nbsp;
            <span className={`font-semibold ${isDark ? 'text-accent-red' : 'text-red-600'}`}>PDF</span> is a branded, print-ready report. All data is live from the database.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Reports;
