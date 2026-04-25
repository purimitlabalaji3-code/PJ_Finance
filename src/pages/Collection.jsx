import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Card from '../components/Card';
import { CheckCircle2, Clock, RefreshCw, Calendar, Search, Zap, CalendarDays } from 'lucide-react';
import toast from 'react-hot-toast';

const CollectionRow = ({ entry, isDark }) => {
  const { markCollectionPaid, markCollectionPending } = useApp();
  const [inputAmt, setInputAmt] = useState(entry.paidAmount > 0 ? String(entry.paidAmount) : '');
  const isPaid = entry.status === 'Paid';

  const handlePaid = async () => {
    const amt = parseFloat(inputAmt);
    if (!amt || amt <= 0) { toast.error('Enter a valid amount'); return; }
    try {
      await markCollectionPaid(entry.id, amt);
      toast.success(`₹${amt} collected from ${entry.customerName} ✅`);
    } catch (err) {
      toast.error(err.message || 'Failed to mark as paid');
    }
  };

  const handlePending = async () => {
    try {
      await markCollectionPending(entry.id);
      setInputAmt('');
      toast.success('Marked as pending');
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border transition-all duration-200 ${
      isPaid
        ? isDark ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-green-50 border-green-200'
        : isDark ? 'bg-red-500/5 border-red-500/20' : 'bg-red-50 border-red-200'
    }`}>
      {/* Customer Info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {entry.image
          ? <img src={entry.image} alt={entry.customerName} className="w-10 h-10 rounded-xl object-cover flex-shrink-0 border-2 border-dark-border" />
          : <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${
              isPaid
                ? isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-green-100 text-green-700'
                : isDark ? 'bg-red-500/20 text-accent-red' : 'bg-red-100 text-red-600'
            }`}>
              {entry.customerName?.charAt(0).toUpperCase() || '?'}
            </div>
        }
        <div className="min-w-0">
          <p className={`font-semibold text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{entry.customerName}</p>
          <div className={`flex flex-col text-[11px] mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <span>{entry.phone ? `${entry.phone} • ` : ''}Due: ₹{entry.dueAmount}</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`font-bold ${isDark ? 'text-yellow-500/80' : 'text-blue-600/80'}`}>
                {entry.date ? new Date(entry.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                entry.loanType === 'Daily' ? 'bg-yellow-400/10 text-yellow-500' : 
                entry.loanType === '15-Day' ? 'bg-blue-400/10 text-blue-500' : 'bg-purple-400/10 text-purple-500'
              }`}>
                {entry.loanType}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
        isPaid
          ? isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-green-100 text-green-700'
          : isDark ? 'bg-red-500/20 text-accent-red' : 'bg-red-100 text-red-600'
      }`}>
        {isPaid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
        {isPaid ? 'Paid' : 'Pending'}
      </div>

      {/* Input & Actions */}
      <div className="flex flex-col gap-2 sm:w-56 flex-shrink-0">
        {!isPaid && (
          <>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className={`absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>₹</span>
                <input
                  type="number"
                  value={inputAmt}
                  onChange={e => setInputAmt(e.target.value)}
                  placeholder={String(entry.dueAmount)}
                  className={`w-full pl-6 pr-2 py-2 text-sm rounded-xl border outline-none transition-all ${isDark
                    ? 'bg-dark-muted border-dark-border text-white placeholder-gray-600 focus:border-yellow-400'
                    : 'bg-white border-light-border text-gray-900 placeholder-gray-400 focus:border-primary-blue'}`}
                />
              </div>
              <button
                onClick={handlePaid}
                title="Mark Paid"
                className={`flex-shrink-0 flex justify-center items-center h-9 w-9 rounded-xl transition-all active:scale-95 ${isDark ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
              >
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
        {isPaid && (
          <div className="flex items-center gap-2 flex-1 w-full justify-between">
            <span className={`text-sm font-bold ${isDark ? 'text-emerald-400' : 'text-green-600'}`}>₹{entry.paidAmount}</span>
            <button
              onClick={handlePending}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${isDark ? 'text-gray-400 hover:text-white hover:bg-dark-muted' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              <RefreshCw className="w-3 h-3" /> Undo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const Collection = () => {
  const { collections, loans, customers, theme, collectionDate, changeCollectionDate } = useApp();
  const isDark = theme === 'dark';
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('type') || 'Daily';
  const displayDate = new Date(collectionDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const [searchTerm, setSearchTerm] = useState('');

  const tabs = [
    { id: 'Daily', label: 'Daily', icon: Zap, color: 'text-yellow-400' },
    { id: '15-Day', label: '15 Days', icon: Clock, color: 'text-blue-400' },
    { id: 'Monthly', label: 'Monthly', icon: CalendarDays, color: 'text-purple-400' },
  ];

  const enrichedCollections = useMemo(() => {
    return collections.map(c => {
      const cust = customers.find(cust => cust.id === c.customerId);
      const loan = loans.find(l => l.id === c.loanId);
      return { 
        ...c, 
        phone: cust?.phone || '', 
        image: cust?.image || null,
        loanType: loan?.loanType || 'Daily'
      };
    });
  }, [collections, loans, customers]);

  const filteredByType = useMemo(() => {
    return enrichedCollections.filter(c => c.loanType === activeTab);
  }, [enrichedCollections, activeTab]);

  const finalFiltered = filteredByType.filter(c =>
    c.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.phone && c.phone.includes(searchTerm))
  );

  const paidCount = filteredByType.filter(c => c.status === 'Paid').length;
  const pendingCount = filteredByType.filter(c => c.status === 'Pending').length;
  const totalCollected = filteredByType.filter(c => c.status === 'Paid').reduce((s, c) => s + c.paidAmount, 0);
  const totalPending = filteredByType.filter(c => c.status === 'Pending').reduce((s, c) => s + c.dueAmount, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Collections</h2>
          <div className="flex items-center gap-2 mt-1">
            <input 
              type="date" 
              value={collectionDate}
              onChange={(e) => changeCollectionDate(e.target.value)}
              className={`px-3 py-1.5 text-sm font-semibold rounded-lg border outline-none cursor-pointer transition-colors ${
                isDark 
                  ? 'bg-dark-muted border-dark-border text-yellow-400 hover:border-yellow-400/50 focus:border-yellow-400' 
                  : 'bg-white border-light-border text-primary-blue hover:border-blue-400 focus:border-primary-blue'
              }`}
            />
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{displayDate}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={`p-1 rounded-2xl flex gap-1 ${isDark ? 'bg-dark-muted' : 'bg-gray-100'}`}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const count = enrichedCollections.filter(c => c.loanType === tab.id).length;
          return (
            <button
              key={tab.id}
              onClick={() => setSearchParams({ type: tab.id })}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all duration-300 ${
                isActive
                  ? isDark ? 'bg-dark-bg text-white shadow-xl' : 'bg-white text-primary-blue shadow-md'
                  : isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? tab.color : 'opacity-50'}`} />
              <span>{tab.label}</span>
              <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[9px] ${
                isActive ? 'bg-primary-blue/10' : 'bg-gray-200/50'
              }`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Due', value: filteredByType.length, color: isDark ? 'text-white' : 'text-gray-900' },
          { label: 'Paid', value: paidCount, color: isDark ? 'text-emerald-400' : 'text-green-600' },
          { label: 'Pending', value: pendingCount, color: isDark ? 'text-accent-red' : 'text-red-600' },
          { label: "Day's Total", value: `₹${totalCollected.toLocaleString('en-IN')}`, color: isDark ? 'text-yellow-400' : 'text-primary-blue' },
        ].map(({ label, value, color }) => (
          <Card key={label} className="p-4">
            <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{label}</p>
            <p className={`text-lg font-black ${color}`}>{value}</p>
          </Card>
        ))}
      </div>

      {/* Progress Bar */}
      <Card className="p-4">
        <div className="flex justify-between text-xs font-bold mb-2">
          <span className={isDark ? 'text-gray-400' : 'text-gray-600 uppercase tracking-wider'}>{activeTab} Collection Progress</span>
          <span className={isDark ? 'text-white' : 'text-gray-900'}>{paidCount}/{filteredByType.length}</span>
        </div>
        <div className={`h-2.5 rounded-full overflow-hidden ${isDark ? 'bg-dark-muted' : 'bg-gray-100'}`}>
          <div
            className={`h-2.5 rounded-full transition-all duration-1000 ease-out ${isDark ? 'bg-yellow-400' : 'bg-primary-blue'}`}
            style={{ width: `${filteredByType.length ? (paidCount / filteredByType.length) * 100 : 0}%` }}
          />
        </div>
        <div className="flex justify-between mt-2.5 text-[10px] font-bold uppercase tracking-tight">
          <span className={isDark ? 'text-emerald-400/80' : 'text-green-600/80'}>Collected: ₹{totalCollected.toLocaleString('en-IN')}</span>
          <span className={isDark ? 'text-accent-red/80' : 'text-red-600/80'}>Remaining: ₹{totalPending.toLocaleString('en-IN')}</span>
        </div>
      </Card>

      {/* Search Bar */}
      <Card className="p-0 overflow-hidden border-none shadow-lg">
        <div className="relative">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
          <input
            className={`w-full pl-11 pr-4 py-3 text-sm outline-none transition-all ${isDark
              ? 'bg-dark-muted text-white placeholder-gray-600 focus:bg-dark-muted/80'
              : 'bg-white text-gray-900 placeholder-gray-400 focus:bg-gray-50'}`}
            placeholder={`Search ${activeTab} collections...`}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </Card>

      {/* Collection List */}
      <div className="space-y-3">
        {filteredByType.length === 0 ? (
          <Card className="text-center py-16">
            <Zap className={`w-10 h-10 mx-auto mb-4 opacity-20 ${isDark ? 'text-yellow-400' : 'text-primary-blue'}`} />
            <p className={`text-sm font-bold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No {activeTab} loans due for this date</p>
          </Card>
        ) : finalFiltered.length === 0 ? (
          <Card className="text-center py-10">
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>No results for "{searchTerm}"</p>
          </Card>
        ) : (
          [...finalFiltered]
            .sort((a, b) => a.status === 'Paid' ? 1 : -1)
            .map(entry => (
              <CollectionRow key={entry.id} entry={entry} isDark={isDark} />
            ))
        )}
      </div>
    </div>
  );
};

export default Collection;
