// Mock data for the application

export const mockCustomers = [
  { id: 1, name: 'Ramesh Kumar', phone: '9876543210', age: 35, gender: 'Male', aadhaar: '1234-5678-9012', address: '45 Gandhi Nagar, Mumbai', status: 'Active', joinDate: '2024-01-10' },
  { id: 2, name: 'Priya Sharma', phone: '9812345678', age: 28, gender: 'Female', aadhaar: '9876-1234-5678', address: '12 Rose Street, Delhi', status: 'Active', joinDate: '2024-01-15' },
  { id: 3, name: 'Suresh Patel', phone: '9654321098', age: 42, gender: 'Male', aadhaar: '5432-8765-4321', address: '78 MG Road, Pune', status: 'Active', joinDate: '2024-02-01' },
  { id: 4, name: 'Anita Devi', phone: '9123456789', age: 31, gender: 'Female', aadhaar: '2345-6789-0123', address: '33 Lake View, Chennai', status: 'Inactive', joinDate: '2024-02-10' },
  { id: 5, name: 'Mahesh Yadav', phone: '9988776655', age: 39, gender: 'Male', aadhaar: '7654-3210-9876', address: '90 Station Road, Hyderabad', status: 'Active', joinDate: '2024-02-20' },
  { id: 6, name: 'Kavita Singh', phone: '9871234560', age: 26, gender: 'Female', aadhaar: '3456-7890-1234', address: '67 Park Colony, Jaipur', status: 'Active', joinDate: '2024-03-01' },
  { id: 7, name: 'Deepak Mishra', phone: '9765432189', age: 44, gender: 'Male', aadhaar: '8901-2345-6789', address: '22 Civil Lines, Lucknow', status: 'Active', joinDate: '2024-03-15' },
  { id: 8, name: 'Sunita Rao', phone: '9634521870', age: 33, gender: 'Female', aadhaar: '4567-8901-2345', address: '54 Banjara Hills, Hyderabad', status: 'Inactive', joinDate: '2024-03-20' },
];

export const mockLoans = [
  { id: 1, customerId: 1, customerName: 'Ramesh Kumar', loanAmount: 50000, interest: 10, startDate: '2024-01-15', status: 'Active', paidDays: 45, totalDays: 100 },
  { id: 2, customerId: 2, customerName: 'Priya Sharma', loanAmount: 30000, interest: 10, startDate: '2024-01-20', status: 'Active', paidDays: 75, totalDays: 100 },
  { id: 3, customerId: 3, customerName: 'Suresh Patel', loanAmount: 75000, interest: 12, startDate: '2024-02-05', status: 'Active', paidDays: 30, totalDays: 100 },
  { id: 4, customerId: 4, customerName: 'Anita Devi', loanAmount: 20000, interest: 10, startDate: '2024-02-15', status: 'Completed', paidDays: 100, totalDays: 100 },
  { id: 5, customerId: 5, customerName: 'Mahesh Yadav', loanAmount: 40000, interest: 10, startDate: '2024-02-25', status: 'Active', paidDays: 60, totalDays: 100 },
  { id: 6, customerId: 6, customerName: 'Kavita Singh', loanAmount: 25000, interest: 10, startDate: '2024-03-05', status: 'Active', paidDays: 20, totalDays: 100 },
];

export const mockCollections = [
  { id: 1, customerId: 1, customerName: 'Ramesh Kumar', dueAmount: 550, paidAmount: 550, date: new Date().toISOString().split('T')[0], status: 'Paid' },
  { id: 2, customerId: 2, customerName: 'Priya Sharma', dueAmount: 330, paidAmount: 0, date: new Date().toISOString().split('T')[0], status: 'Pending' },
  { id: 3, customerId: 3, customerName: 'Suresh Patel', dueAmount: 900, paidAmount: 900, date: new Date().toISOString().split('T')[0], status: 'Paid' },
  { id: 4, customerId: 5, customerName: 'Mahesh Yadav', dueAmount: 440, paidAmount: 0, date: new Date().toISOString().split('T')[0], status: 'Pending' },
  { id: 5, customerId: 6, customerName: 'Kavita Singh', dueAmount: 275, paidAmount: 275, date: new Date().toISOString().split('T')[0], status: 'Paid' },
  { id: 6, customerId: 7, customerName: 'Deepak Mishra', dueAmount: 700, paidAmount: 0, date: new Date().toISOString().split('T')[0], status: 'Pending' },
];

export const monthlyData = [
  { month: 'Oct', collection: 180000, loans: 120000 },
  { month: 'Nov', collection: 210000, loans: 150000 },
  { month: 'Dec', collection: 195000, loans: 130000 },
  { month: 'Jan', collection: 240000, loans: 200000 },
  { month: 'Feb', collection: 265000, loans: 220000 },
  { month: 'Mar', collection: 290000, loans: 180000 },
];

export const weeklyData = [
  { day: 'Mon', amount: 8500 },
  { day: 'Tue', amount: 12000 },
  { day: 'Wed', amount: 9800 },
  { day: 'Thu', amount: 14200 },
  { day: 'Fri', amount: 11500 },
  { day: 'Sat', amount: 16800 },
  { day: 'Sun', amount: 6200 },
];
