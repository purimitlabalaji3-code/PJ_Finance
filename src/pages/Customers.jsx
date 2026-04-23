import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { Search, UserPlus, Edit2, Trash2, Eye, Phone, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const StatusBadge = ({ status, isDark }) => (
  <span className={`badge ${status === 'Active'
    ? isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-green-100 text-green-700'
    : isDark ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-100 text-gray-500'
    }`}>{status}</span>
);

const Customers = () => {
  const { customers, deleteCustomer, theme } = useApp();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    c.customerCode?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    try {
      await deleteCustomer(deleteTarget.id);
      toast.success(`${deleteTarget.name} deleted successfully`);
    } catch (err) {
      toast.error(err.message || 'Failed to delete customer');
    } finally {
      setDeleteTarget(null);
    }
  };

  const columns = [
    {
      header: 'Code', key: 'customerCode',
      render: (row) => (
        <span className={`text-xs font-mono font-bold ${isDark ? 'text-yellow-400' : 'text-primary-blue'}`}>
          {row.customerCode}
        </span>
      )
    },
    {
      header: 'Customer', key: 'name',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          {/* Show real photo if available, else letter avatar */}
          {row.image
            ? <img src={row.image} alt={row.name} className="w-9 h-9 rounded-xl object-cover flex-shrink-0 border-2 border-dark-border" />
            : <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm ${isDark ? 'bg-yellow-400/10 text-yellow-400' : 'bg-blue-50 text-primary-blue'}`}>
              {row.name.charAt(0).toUpperCase()}
            </div>
          }
          <div>
            <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{row.name}</p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{row.phone}</p>
          </div>
        </div>
      )
    },
    { header: 'Gender', key: 'gender' },
    { header: 'Age', key: 'age' },
    {
      header: 'Status', key: 'status',
      render: (row) => <StatusBadge status={row.status} isDark={isDark} />
    },
    {
      header: 'Joined', key: 'joinDate',
      render: (row) => <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{row.joinDate}</span>
    },
    {
      header: 'Actions', key: 'actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewTarget(row)}
            className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-gray-400 hover:text-blue-400 hover:bg-blue-400/10' : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'}`}
            title="View"
          ><Eye className="w-4 h-4" /></button>
          <button
            onClick={() => navigate('/customers/add', { state: { edit: row } })}
            className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10' : 'text-gray-500 hover:text-yellow-600 hover:bg-yellow-50'}`}
            title="Edit"
          ><Edit2 className="w-4 h-4" /></button>
          <button
            onClick={() => setDeleteTarget(row)}
            className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-gray-400 hover:text-accent-red hover:bg-red-500/10' : 'text-gray-500 hover:text-red-600 hover:bg-red-50'}`}
            title="Delete"
          ><Trash2 className="w-4 h-4" /></button>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>All Customers</h2>
          <p className={`text-sm mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{customers.length} total customers registered</p>
        </div>
        <Button icon={UserPlus} onClick={() => navigate('/customers/add')}>Add Customer</Button>
      </div>

      {/* Search & Filter */}
      <Card>
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
          <input
            className={`input-field pl-9 ${isDark
              ? 'bg-dark-muted border-dark-border text-white placeholder-gray-500 focus:border-yellow-400'
              : 'bg-white border-light-border text-gray-900 placeholder-gray-400 focus:border-primary-blue'}`}
            placeholder="Search by name, phone or PJ code..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </Card>

      {/* Table */}
      <Card className="!p-0 overflow-hidden">
        <Table columns={columns} data={filtered} emptyMessage="No customers found. Add your first customer!" />
      </Card>

      {/* View Modal */}
      <Modal isOpen={!!viewTarget} onClose={() => setViewTarget(null)} title="Customer Details">
        {viewTarget && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {viewTarget.image
                ? <img src={viewTarget.image} alt={viewTarget.name} className="w-20 h-20 rounded-2xl object-cover flex-shrink-0 border-2 border-dark-border shadow-lg" />
                : <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold flex-shrink-0 ${isDark ? 'bg-yellow-400/10 text-yellow-400' : 'bg-blue-50 text-primary-blue'}`}>
                  {viewTarget.name.charAt(0).toUpperCase()}
                </div>
              }
              <div>
                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{viewTarget.name}</h3>
                <StatusBadge status={viewTarget.status} isDark={isDark} />
              </div>
            </div>
            <div className={`grid grid-cols-2 gap-3 p-4 rounded-xl ${isDark ? 'bg-dark-muted' : 'bg-gray-50'}`}>
              {[
                { label: 'Phone', value: viewTarget.phone, icon: Phone },
                { label: 'Age', value: viewTarget.age },
                { label: 'Gender', value: viewTarget.gender },
                { label: 'Aadhaar', value: viewTarget.aadhaar || 'N/A' },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label}>
                  <p className={`text-xs mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{label}</p>
                  <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
                </div>
              ))}
            </div>
            <div className={`flex items-start gap-2 p-3 rounded-xl ${isDark ? 'bg-dark-muted' : 'bg-gray-50'}`}>
              <MapPin className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDark ? 'text-yellow-400' : 'text-primary-blue'}`} />
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{viewTarget.address}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Customer"
        size="sm"
        footer={<>
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </>}
      >
        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default Customers;
