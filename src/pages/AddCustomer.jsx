import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Card from '../components/Card';
import Button from '../components/Button';
import FormInput from '../components/FormInput';
import { ArrowLeft, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const AddCustomer = () => {
  const { addCustomer, updateCustomer, theme } = useApp();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const location = useLocation();
  const editData = location.state?.edit;
  const isEdit = !!editData;

  const [form, setForm] = useState({
    name: '', phone: '', age: '', gender: '', aadhaar: '', address: '', image: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editData) setForm(editData);
  }, [editData]);

  const set = (field) => (e) => {
    setForm(p => ({ ...p, [field]: e.target.value }));
    if (errors[field]) setErrors(p => ({ ...p, [field]: '' }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(p => ({ ...p, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(form.phone)) e.phone = 'Enter a valid 10-digit phone number';
    if (!form.age) e.age = 'Age is required';
    else if (form.age < 18 || form.age > 100) e.age = 'Age must be between 18 and 100';
    if (!form.gender) e.gender = 'Gender is required';
    if (!form.address.trim()) e.address = 'Address is required';
    if (form.aadhaar && !/^\d{4}-\d{4}-\d{4}$/.test(form.aadhaar)) e.aadhaar = 'Format: XXXX-XXXX-XXXX';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      if (isEdit) {
        updateCustomer(editData.id, form);
        toast.success('Customer updated successfully! ✅');
      } else {
        addCustomer(form);
        toast.success('Customer added successfully! 🎉');
      }
      setLoading(false);
      navigate('/customers');
    }, 600);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/customers')}
          className={`p-2 rounded-xl transition-colors ${isDark ? 'text-gray-400 hover:text-white hover:bg-dark-muted' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {isEdit ? 'Edit Customer' : 'Add New Customer'}
          </h2>
          <p className={`text-sm mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {isEdit ? 'Update customer information' : 'Fill in the details to register a new customer'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <h3 className={`font-semibold text-sm mb-4 pb-3 border-b ${isDark ? 'text-gray-300 border-dark-border' : 'text-gray-700 border-light-border'}`}>
            Personal Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="Full Name" id="name" required placeholder="e.g. Ramesh Kumar"
              value={form.name} onChange={set('name')} error={errors.name} />
            <FormInput label="Phone Number" id="phone" required placeholder="10-digit mobile number"
              value={form.phone} onChange={set('phone')} error={errors.phone} />
            <FormInput label="Age" id="age" type="number" required placeholder="e.g. 30"
              value={form.age} onChange={set('age')} error={errors.age} />
            <FormInput label="Gender" id="gender" type="select" required
              value={form.gender} onChange={set('gender')} error={errors.gender}
              options={['Male', 'Female', 'Other']} />
            <FormInput label="Aadhaar Number" id="aadhaar" placeholder="XXXX-XXXX-XXXX (optional)"
              value={form.aadhaar} onChange={set('aadhaar')} error={errors.aadhaar}
              hint="Optional – used for identity verification" />
            <FormInput label="Address" id="address" type="textarea" required placeholder="Full address..."
              value={form.address} onChange={set('address')} error={errors.address} className="sm:col-span-2" />
              
            {/* Image Upload */}
            <div className="sm:col-span-2">
              <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Profile Image (Optional)
              </label>
              <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl ${isDark ? 'border-dark-border hover:border-yellow-400/50' : 'border-light-border hover:border-blue-500/50'} transition-colors relative overflow-hidden group`}>
                <div className="space-y-1 text-center">
                  {form.image ? (
                    <div className="relative inline-block">
                      <img src={form.image} alt="Preview" className="mx-auto h-32 w-32 object-cover rounded-full border-4 border-white dark:border-dark-muted shadow-md" />
                      <button type="button" onClick={() => setForm(p => ({ ...p, image: '' }))} className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ) : (
                    <svg className={`mx-auto h-12 w-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  {!form.image && (
                    <>
                      <div className="flex text-sm justify-center mt-2">
                        <label htmlFor="file-upload" className={`relative cursor-pointer rounded-md font-medium ${isDark ? 'text-yellow-400 hover:text-yellow-300' : 'text-blue-600 hover:text-blue-500'} focus-within:outline-none`}>
                          <span>Upload a file</span>
                          <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                        </label>
                        <p className={`pl-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>or drag and drop</p>
                      </div>
                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>PNG, JPG, GIF up to 5MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-opacity-50" style={{ borderColor: isDark ? '#2A2A2A' : '#E5E7EB' }}>
            <Button type="button" variant="ghost" onClick={() => navigate('/customers')}>Cancel</Button>
            <Button type="submit" icon={UserCheck} loading={loading}>
              {isEdit ? 'Update Customer' : 'Add Customer'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default AddCustomer;
