import React from 'react';
import { useApp } from '../context/AppContext';
import Card from '../components/Card';
import Button from '../components/Button';
import { Download, FileText, Users, BarChart2, Calendar, FileBarChart } from 'lucide-react';
import toast from 'react-hot-toast';

const ReportButton = ({ label, icon: Icon, onClick, variant, isDark }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold w-full transition-all active:scale-95 border ${
      variant === 'primary'
        ? isDark
          ? 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/20'
          : 'bg-blue-50 border-blue-200 text-primary-blue hover:bg-blue-100'
        : variant === 'success'
        ? isDark
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
          : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
        : variant === 'warning'
        ? isDark
          ? 'bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20'
          : 'bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100'
        : isDark
          ? 'bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20'
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

  const handleDownload = (type) => {
    toast.success(`${type} report download started 📥`, { duration: 2000 });
  };

  // Quick stats
  const totalCollected = collections.filter(c => c.status === 'Paid').reduce((s, c) => s + c.paidAmount, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Reports</h2>
        <p className={`text-sm mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Download reports in PDF format</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Customers', value: customers.length },
          { label: 'Active Loans', value: loans.filter(l => l.status === 'Active').length },
          { label: 'Today Collected', value: `₹${totalCollected.toLocaleString('en-IN')}` },
          { label: 'Total Disbursed', value: `₹${loans.reduce((s,l) => s + Number(l.loanAmount), 0).toLocaleString('en-IN')}` },
        ].map(({ label, value }) => (
          <Card key={label} className="text-center">
            <p className={`text-xl font-bold ${isDark ? 'text-yellow-400' : 'text-primary-blue'}`}>{value}</p>
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</p>
          </Card>
        ))}
      </div>

      {/* Report Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SectionCard title="Customer Reports" description="Individual customer collection history" icon={Users} isDark={isDark}>
          <ReportButton label="Daily Customer Report" icon={FileText} variant="primary" isDark={isDark} onClick={() => handleDownload('Daily Customer')} />
          <ReportButton label="Weekly Customer Report" icon={Calendar} variant="success" isDark={isDark} onClick={() => handleDownload('Weekly Customer')} />
          <ReportButton label="Monthly Customer Report" icon={BarChart2} variant="warning" isDark={isDark} onClick={() => handleDownload('Monthly Customer')} />
          <ReportButton label="100-Days Customer PDF" icon={FileBarChart} variant="purple" isDark={isDark} onClick={() => handleDownload('100 Days Customer')} />
        </SectionCard>

        <SectionCard title="Overall Reports" description="Business-wide collection summaries" icon={BarChart2} isDark={isDark}>
          <ReportButton label="Daily Overall Report" icon={FileText} variant="primary" isDark={isDark} onClick={() => handleDownload('Daily Overall')} />
          <ReportButton label="Weekly Overall Report" icon={Calendar} variant="success" isDark={isDark} onClick={() => handleDownload('Weekly Overall')} />
          <ReportButton label="Monthly Overall Report" icon={BarChart2} variant="warning" isDark={isDark} onClick={() => handleDownload('Monthly Overall')} />
          <ReportButton label="Business Summary PDF" icon={FileBarChart} variant="purple" isDark={isDark} onClick={() => handleDownload('Business Summary')} />
        </SectionCard>
      </div>

      {/* Info Note */}
      <Card className={`border-dashed ${isDark ? 'border-dark-border' : 'border-light-border'}`}>
        <div className={`flex items-start gap-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          <FileText className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-semibold mb-1">PDF Download System</p>
            <p>Reports will be generated with current data snapshot. Connect to backend to enable real PDF generation using jsPDF or server-side rendering.</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Reports;
