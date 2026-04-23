import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Card from '../components/Card';
import { CheckCircle2, Clock, RefreshCw, Calendar, Search, Zap } from 'lucide-react';
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
        {/* Customer photo or letter avatar */}
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
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {entry.phone ? `${entry.phone} • ` : ''}Due: ₹{entry.dueAmount}
          </p>
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
            
            {/* Quick Amount Buttons */}
            <div className="flex items-center gap-1.5">
              {[100, 500, 1000].map(amt => (
                <button
                  key={amt}
                  onClick={() => setInputAmt(String(amt))}
                  className={`flex-1 py-1 rounded-md text-[10px] font-bold transition-colors ${
                    inputAmt === String(amt) 
                      ? (isDark ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30' : 'bg-blue-100 text-blue-700 border border-blue-300')
                      : (isDark ? 'bg-dark-muted text-gray-400 hover:text-gray-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')
                  }`}
                >
                  ₹{amt}
                </button>
              ))}
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
  const { collections, customers, theme, generateCollections, collectionDate, changeCollectionDate } = useApp();
  const isDark = theme === 'dark';
  const displayDate = new Date(collectionDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const [searchTerm, setSearchTerm] = useState('');
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const result = await generateCollections(collectionDate);
      toast.success(result?.message || `Collections generated for ${collectionDate}! ✅`);
    } catch (err) {
      toast.error(err.message || 'Failed to generate collections');
    } finally {
      setGenerating(false);
    }
  };

  const enrichedCollections = collections.map(c => {
    const cust = customers.find(cust => cust.id === c.customerId);
    return { ...c, phone: cust?.phone || '', image: cust?.image || null };
  });

  const filteredCollections = enrichedCollections.filter(c =>
    c.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.phone && c.phone.includes(searchTerm))
  );

  const paidCount = collections.filter(c => c.status === 'Paid').length;
  const pendingCount = collections.filter(c => c.status === 'Pending').length;
  const totalCollected = collections.filter(c => c.status === 'Paid').reduce((s, c) => s + c.paidAmount, 0);
  const totalPending = collections.filter(c => c.status === 'Pending').reduce((s, c) => s + c.dueAmount, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Daily Collection</h2>
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
          </div>
        </div>
        {/* Generate Collections */}
        <button
          onClick={handleGenerate}
          disabled={generating}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 flex-shrink-0 ${
            generating ? 'opacity-60 cursor-not-allowed' : ''
          } ${
            isDark
              ? 'bg-yellow-400/10 text-yellow-400 hover:bg-yellow-400/20 border border-yellow-400/20'
              : 'bg-blue-50 text-primary-blue hover:bg-blue-100 border border-blue-200'
          }`}
        >
          {generating
            ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            : <Zap className="w-4 h-4" />
          }
          {generating ? 'Generating...' : 'Generate For Date'}
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Entries', value: collections.length, color: isDark ? 'text-yellow-400' : 'text-primary-blue' },
          { label: 'Paid', value: paidCount, color: isDark ? 'text-emerald-400' : 'text-green-600' },
          { label: 'Pending', value: pendingCount, color: isDark ? 'text-accent-red' : 'text-red-600' },
          { label: "Day's Total", value: `₹${totalCollected.toLocaleString('en-IN')}`, color: isDark ? 'text-yellow-400' : 'text-primary-blue' },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <p className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</p>
            <p className={`text-lg font-bold ${color}`}>{value}</p>
          </Card>
        ))}
      </div>

      {/* Progress Bar */}
      <Card>
        <div className="flex justify-between text-sm mb-2">
          <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Collection Progress</span>
          <span className={`font-bold ${isDark ? 'text-yellow-400' : 'text-primary-blue'}`}>{paidCount}/{collections.length}</span>
        </div>
        <div className={`h-3 rounded-full overflow-hidden ${isDark ? 'bg-dark-muted' : 'bg-gray-100'}`}>
          <div
            className={`h-3 rounded-full transition-all duration-700 ${isDark ? 'bg-yellow-400' : 'bg-primary-blue'}`}
            style={{ width: `${collections.length ? (paidCount / collections.length) * 100 : 0}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs">
          <span className={isDark ? 'text-emerald-400' : 'text-green-600'}>Collected: ₹{totalCollected.toLocaleString('en-IN')}</span>
          <span className={isDark ? 'text-accent-red' : 'text-red-600'}>Pending: ₹{totalPending.toLocaleString('en-IN')}</span>
        </div>
      </Card>

      {/* Search Bar */}
      <Card>
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
          <input
            className={`w-full pl-9 pr-4 py-2.5 text-sm outline-none rounded-xl border transition-all ${isDark
              ? 'bg-dark-muted border-dark-border text-white placeholder-gray-500 focus:border-yellow-400'
              : 'bg-white border-light-border text-gray-900 placeholder-gray-400 focus:border-primary-blue'}`}
            placeholder="Search by customer name or mobile number..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </Card>

      {/* Collection List */}
      <div className="space-y-3">
        {collections.length === 0 ? (
          <Card className="text-center py-10">
            <Zap className={`w-8 h-8 mx-auto mb-3 ${isDark ? 'text-yellow-400/40' : 'text-blue-300'}`} />
            <p className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>No collections for {displayDate}</p>
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Click "Generate For Date" to create collection entries for all active loans on this date
            </p>
          </Card>
        ) : filteredCollections.length === 0 ? (
          <Card className="text-center py-8">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No results for "{searchTerm}"</p>
          </Card>
        ) : (
          [...filteredCollections]
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
