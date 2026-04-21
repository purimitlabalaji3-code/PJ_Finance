import React from 'react';
import { useApp } from '../context/AppContext';
import Card from '../components/Card';
import { Download, FileText, Users, BarChart2, Calendar, FileBarChart, Percent, IndianRupee, TrendingUp, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

// ── CSV Export Helper ──────────────────────────────────────────────────────
const downloadCSV = (filename, headers, rows) => {
  const escape = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;
  const csv = [headers.join(','), ...rows.map(r => r.map(escape).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

const ReportButton = ({ label, icon: Icon, onClick, variant, isDark }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold w-full transition-all active:scale-95 border ${
      variant === 'primary'
        ? isDark ? 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/20'
                 : 'bg-blue-50 border-blue-200 text-primary-blue hover:bg-blue-100'
      : variant === 'success'
        ? isDark ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                 : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
      : variant === 'warning'
        ? isDark ? 'bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20'
                 : 'bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100'
        : isDark ? 'bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20'
                 : 'bg-purple-50 border-purple-200 text-purple-600 hover:bg-purple-100'
    }`}
  >
    <Icon className="w-4 h-4 flex-shrink-0" />
    <span className="flex-1 text-left">{label}</span>
    <Download className="w-4 h-4 flex-shrink-0 opacity-60" />
  </button>
);

const SectionCard = ({ title, description, icon: Icon, isDark, children }) => (
  <Card>
    <div className="flex items-start gap-3 mb-5">
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
  const { theme, customers, loans, collections } = useApp();
  const isDark = theme === 'dark';

  // ── Computed stats ───────────────────────────────────────────────────────
  const today        = new Date().toISOString().split('T')[0];
  const totalCollected   = collections.filter(c => c.status === 'Paid').reduce((s, c) => s + Number(c.paidAmount), 0);
  const totalPending     = collections.filter(c => c.status === 'Pending').reduce((s, c) => s + Number(c.dueAmount), 0);
  const totalDisbursed   = loans.reduce((s, l) => s + Number(l.loanAmount), 0);
  const totalInterest    = loans.reduce((s, l) => {
    const total = Number(l.totalAmount) || Number(l.loanAmount) * (1 + Number(l.interest) / 100);
    return s + (total - Number(l.loanAmount));
  }, 0);
  const totalPayable     = totalDisbursed + totalInterest;
  const activeLoans      = loans.filter(l => l.status === 'Active').length;
  const completedLoans   = loans.filter(l => l.status === 'Completed').length;
  const paidToday        = collections.filter(c => c.status === 'Paid').length;

  // ── Export: Customer List ────────────────────────────────────────────────
  const exportCustomerList = () => {
    downloadCSV(`customers_${today}.csv`,
      ['ID', 'Name', 'Phone', 'Age', 'Gender', 'Aadhaar', 'Address', 'Status', 'Join Date'],
      customers.map(c => [c.id, c.name, c.phone, c.age, c.gender, c.aadhaar, c.address, c.status, c.joinDate])
    );
    toast.success('Customer list exported ✅');
  };

  // ── Export: Loan Summary ─────────────────────────────────────────────────
  const exportLoanSummary = () => {
    downloadCSV(`loans_${today}.csv`,
      ['Loan ID', 'Customer', 'Principal (₹)', 'Interest (%)', 'Interest Amt (₹)', 'Total Payable (₹)', 'Daily EMI (₹)', 'Paid Days', 'Total Days', 'Status', 'Start Date'],
      loans.map(l => {
        const principal = Number(l.loanAmount);
        const totalAmt  = Number(l.totalAmount) || principal * (1 + Number(l.interest) / 100);
        const interest  = totalAmt - principal;
        return [l.id, l.customerName, principal, `${l.interest}%`, Math.round(interest), Math.round(totalAmt), l.dailyAmount, l.paidDays, l.totalDays, l.status, l.startDate];
      })
    );
    toast.success('Loan summary exported ✅');
  };

  // ── Export: Today's Collection ───────────────────────────────────────────
  const exportTodayCollection = () => {
    downloadCSV(`collection_${today}.csv`,
      ['Customer', 'Due Amount (₹)', 'Paid Amount (₹)', 'Status', 'Date'],
      collections.map(c => [c.customerName, c.dueAmount, c.paidAmount, c.status, c.date])
    );
    toast.success("Today's collection exported ✅");
  };

  // ── Export: Full Business Summary ────────────────────────────────────────
  const exportBusinessSummary = () => {
    downloadCSV(`business_summary_${today}.csv`,
      ['Metric', 'Value'],
      [
        ['Total Customers', customers.length],
        ['Active Loans', activeLoans],
        ['Completed Loans', completedLoans],
        ['Total Disbursed (₹)', totalDisbursed],
        ['Total Interest (₹)', Math.round(totalInterest)],
        ['Total Payable (₹)', Math.round(totalPayable)],
        ["Today's Collected (₹)", totalCollected],
        ["Today's Pending (₹)", totalPending],
        ['Paid Today (count)', paidToday],
        ['Export Date', today],
      ]
    );
    toast.success('Business summary exported ✅');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Reports</h2>
        <p className={`text-sm mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Live data exports — all reports use real database values</p>
      </div>

      {/* Quick Stats — 8 KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Customers', value: customers.length,                              icon: Users,        color: isDark ? 'text-yellow-400' : 'text-primary-blue' },
          { label: 'Active Loans',    value: activeLoans,                                    icon: BarChart2,    color: isDark ? 'text-purple-400'  : 'text-purple-600' },
          { label: 'Total Disbursed', value: `₹${totalDisbursed.toLocaleString('en-IN')}`,  icon: IndianRupee,  color: isDark ? 'text-orange-400'  : 'text-orange-600' },
          { label: 'Total Interest',  value: `₹${Math.round(totalInterest).toLocaleString('en-IN')}`, icon: Percent, color: isDark ? 'text-pink-400' : 'text-pink-600' },
          { label: 'Total Payable',   value: `₹${Math.round(totalPayable).toLocaleString('en-IN')}`,  icon: TrendingUp, color: isDark ? 'text-emerald-400' : 'text-green-600' },
          { label: 'Collected Today', value: `₹${totalCollected.toLocaleString('en-IN')}`,  icon: CheckCircle2, color: isDark ? 'text-emerald-400' : 'text-green-600' },
          { label: 'Pending Today',   value: `₹${totalPending.toLocaleString('en-IN')}`,    icon: FileText,     color: isDark ? 'text-accent-red'  : 'text-red-500' },
          { label: 'Paid Today',      value: `${paidToday} / ${collections.length}`,         icon: Calendar,     color: isDark ? 'text-cyan-400'    : 'text-cyan-600' },
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

      {/* Export Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SectionCard title="Customer Reports" description="Download customer data as CSV" icon={Users} isDark={isDark}>
          <ReportButton label="Export Customer List (CSV)" icon={FileText} variant="primary" isDark={isDark} onClick={exportCustomerList} />
          <ReportButton label="Export Loan Summary (CSV)" icon={BarChart2} variant="success" isDark={isDark} onClick={exportLoanSummary} />
        </SectionCard>

        <SectionCard title="Collection Reports" description="Download daily & business collection data" icon={BarChart2} isDark={isDark}>
          <ReportButton label="Export Today's Collection (CSV)" icon={Calendar} variant="warning" isDark={isDark} onClick={exportTodayCollection} />
          <ReportButton label="Export Business Summary (CSV)" icon={FileBarChart} variant="purple" isDark={isDark} onClick={exportBusinessSummary} />
        </SectionCard>
      </div>

      {/* Info Note */}
      <Card className={`border-dashed ${isDark ? 'border-dark-border' : 'border-light-border'}`}>
        <div className={`flex items-start gap-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          <FileText className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-semibold mb-1">About Exports</p>
            <p>All exports use <strong className={isDark ? 'text-white' : 'text-gray-800'}>live data</strong> from the database. CSV files open in Excel, Google Sheets, or any spreadsheet app. PDF generation can be enabled using jsPDF.</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Reports;
