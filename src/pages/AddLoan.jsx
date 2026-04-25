import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Card from '../components/Card';
import Button from '../components/Button';
import FormInput from '../components/FormInput';
import { ArrowLeft, Calculator } from 'lucide-react';
import toast from 'react-hot-toast';

const AddLoan = () => {
  const { customers, addLoan, loadAll, theme } = useApp();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  const [form, setForm] = useState({
    customerId: '', loanType: 'Daily', loanAmount: '', interest: '10', startDate: new Date().toLocaleDateString('en-CA')
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => {
    setForm(p => ({ ...p, [field]: e.target.value }));
    if (errors[field]) setErrors(p => ({ ...p, [field]: '' }));
  };

  const loanAmt = parseFloat(form.loanAmount) || 0;
  const interest = parseFloat(form.interest) || 0;
  const isDaily = form.loanType === 'Daily';
  
  const totalAmount = isDaily ? loanAmt + (loanAmt * interest / 100) : loanAmt;
  const dailyAmount = isDaily ? (loanAmt ? Math.ceil(totalAmount / 100) : 0) : Math.ceil(loanAmt * interest / 100);

  const validate = () => {
    const e = {};
    if (!form.customerId) e.customerId = 'Please select a customer';
    if (!form.loanAmount) e.loanAmount = 'Loan amount is required';
    else if (loanAmt < 1000) e.loanAmount = 'Minimum loan amount is ₹1,000';
    if (!form.interest) e.interest = 'Interest rate is required';
    else if (interest < 0 || interest > 100) e.interest = 'Interest must be 0-100%';
    if (!form.startDate) e.startDate = 'Start date is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await addLoan(form);
      // Refresh all data (loans, collections, dashboard stats) before navigating
      await loadAll();
      toast.success('Loan created successfully! 💰');
      navigate('/loans');
    } catch (err) {
      toast.error(err.message || 'Failed to create loan');
    } finally {
      setLoading(false);
    }
  };

  const customerOptions = customers.filter(c => c.status === 'Active').map(c => ({
    value: c.id, label: `${c.name} — ${c.phone}`
  }));

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/loans')}
          className={`p-2 rounded-xl transition-colors ${isDark ? 'text-gray-400 hover:text-white hover:bg-dark-muted' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Add New Loan</h2>
          <p className={`text-sm mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Create a 100-day loan plan</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <h3 className={`font-semibold text-sm mb-4 pb-3 border-b ${isDark ? 'text-gray-300 border-dark-border' : 'text-gray-700 border-light-border'}`}>
            Loan Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="Select Customer" id="customerId" type="select"
              required value={form.customerId} onChange={set('customerId')}
              error={errors.customerId} options={customerOptions} />
            <FormInput label="Loan Type" id="loanType" type="select"
              required value={form.loanType} onChange={set('loanType')}
              options={['Daily', '15-Day', 'Monthly']} />
            <FormInput label="Loan Amount (₹)" id="loanAmount" type="number"
              required placeholder="e.g. 100000"
              value={form.loanAmount} onChange={set('loanAmount')} error={errors.loanAmount} />
            <FormInput label="Interest (%)" id="interest" type="number"
              required placeholder="e.g. 3"
              value={form.interest} onChange={set('interest')} error={errors.interest} />
            <FormInput label="Start Date" id="startDate" type="date"
              required value={form.startDate} onChange={set('startDate')}
              error={errors.startDate} className="sm:col-span-2" />
          </div>
        </Card>

        {/* Auto Calculation Display */}
        {loanAmt > 0 && (
          <Card className={`border-2 ${isDark ? 'border-yellow-400/30 bg-yellow-400/5' : 'border-blue-200 bg-blue-50/50'}`}>
            <div className="flex items-center gap-2 mb-4">
              <Calculator className={`w-5 h-5 ${isDark ? 'text-yellow-400' : 'text-primary-blue'}`} />
              <h3 className={`font-bold text-sm ${isDark ? 'text-yellow-400' : 'text-primary-blue'}`}>
                {isDaily ? 'Auto Calculation (100-Day Plan)' : `Term Plan (${form.loanType})`}
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              {/* Principal */}
              <div className={`p-3 rounded-xl ${isDark ? 'bg-dark-muted' : 'bg-white'}`}>
                <p className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Principal</p>
                <p className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>₹{loanAmt.toLocaleString('en-IN')}</p>
              </div>
              {/* Interest Amount */}
              <div className={`p-3 rounded-xl border-2 ${isDark ? 'bg-pink-500/10 border-pink-500/30' : 'bg-pink-50 border-pink-200'}`}>
                <p className={`text-xs mb-1 ${isDark ? 'text-pink-300' : 'text-pink-600'}`}>{isDaily ? `Interest (${interest}%)` : `Interest / Cycle (${interest}%)`}</p>
                <p className={`text-base font-bold ${isDark ? 'text-pink-400' : 'text-pink-600'}`}>
                  ₹{isDaily ? (totalAmount - loanAmt).toLocaleString('en-IN') : dailyAmount.toLocaleString('en-IN')}
                </p>
              </div>
              {/* Total Payable */}
              <div className={`p-3 rounded-xl ${isDark ? 'bg-dark-muted' : 'bg-white'}`}>
                <p className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{isDaily ? 'Total Payable' : 'Principal Due'}</p>
                <p className={`text-base font-bold ${isDark ? 'text-yellow-400' : 'text-primary-blue'}`}>₹{totalAmount.toLocaleString('en-IN')}</p>
              </div>
              {/* Daily EMI / Cycle EMI */}
              <div className={`p-3 rounded-xl ${isDark ? 'bg-dark-muted' : 'bg-white'}`}>
                <p className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{isDaily ? 'Daily EMI' : 'Payment'}</p>
                <p className={`text-base font-bold ${isDark ? 'text-emerald-400' : 'text-green-600'}`}>₹{dailyAmount}</p>
              </div>
            </div>
            <div className={`mt-4 p-4 rounded-xl text-xs space-y-2 ${isDark ? 'bg-dark-muted' : 'bg-white shadow-sm border border-light-border'}`}>
              <p className={`flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <span>📋</span>
                {isDaily ? (
                  <span>The customer will pay <strong className={isDark ? 'text-white' : 'text-gray-900'}>₹{dailyAmount}/day</strong> for <strong className={isDark ? 'text-white' : 'text-gray-900'}>100 days</strong> = Total <strong className={isDark ? 'text-white' : 'text-gray-900'}>₹{(dailyAmount * 100).toLocaleString('en-IN')}</strong></span>
                ) : (
                  <span>The customer will pay <strong className={isDark ? 'text-white' : 'text-gray-900'}>₹{dailyAmount}</strong> every <strong className={isDark ? 'text-white' : 'text-gray-900'}>{form.loanType === '15-Day' ? '15 days' : '1 month'}</strong> until principal is returned.</span>
                )}
              </p>
              {isDaily && form.startDate && (
                <p className={`flex items-center gap-2 pt-2 border-t ${isDark ? 'text-gray-400 border-dark-border' : 'text-gray-500 border-gray-100'}`}>
                  <span>📅</span>
                  <span>Estimated End Date (excluding Sundays): <strong className={isDark ? 'text-emerald-400' : 'text-green-600'}>
                    {(() => {
                      const d = new Date(form.startDate);
                      let t = 100;
                      if (d.getDay() === 0) d.setDate(d.getDate() + 1);
                      t--;
                      while (t > 0) {
                        d.setDate(d.getDate() + 1);
                        if (d.getDay() !== 0) t--;
                      }
                      return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
                    })()}
                  </strong></span>
                </p>
              )}
            </div>
          </Card>
        )}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => navigate('/loans')}>Cancel</Button>
          <Button type="submit" loading={loading} icon={Calculator}>Create Loan</Button>
        </div>
      </form>
    </div>
  );
};

export default AddLoan;
