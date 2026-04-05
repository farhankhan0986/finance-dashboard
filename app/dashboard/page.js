'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [categoryTotals, setCategoryTotals] = useState([]);
  const [trends, setTrends] = useState([]);
  const [recentRecords, setRecentRecords] = useState([]);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    category: '',
    record_date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  
  const router = useRouter();

  const fetchDashboard = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const [resSummary, resActivity, resCategory, resTrends] = await Promise.all([
        fetch('/api/dashboard/summary', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/dashboard/recent-activity', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/dashboard/category-totals', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/dashboard/trends', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      const summaryData = await resSummary.json();
      const activityData = await resActivity.json();
      const categoryData = await resCategory.json();
      const trendsData = await resTrends.json();
      
      if (resSummary.status === 401 || resSummary.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
        return;
      }

      if (!resSummary.ok) throw new Error(summaryData.message || 'Failed to fetch summary');

      setSummary(summaryData.data);
      setRecentRecords(activityData.data || []);
      setCategoryTotals(categoryData.data || []);
      setTrends(trendsData.data || []);
    } catch (err) {
      setError(err.message);
    }
  }, [router]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token) {
      router.push('/login');
      return;
    }

    if (userStr) {
      setUser(JSON.parse(userStr));
    }

    fetchDashboard();
  }, [router, fetchDashboard]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handleAddRecord = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch('/api/records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to add record');
      }

      setIsModalOpen(false);
      setFormData({
        amount: '',
        type: 'expense',
        category: '',
        record_date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      fetchDashboard();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error && !isModalOpen) return <div className="p-8 text-red-500">Error: {error}</div>;
  if (!summary && !error) return <div className="p-8 text-gray-500 flex justify-center items-center h-screen">Loading dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">Welcome back, {user?.name} <span className="bg-blue-100 text-blue-700 py-0.5 px-2 rounded-full text-xs ml-2 uppercase tracking-wider">{user?.role}</span></p>
          </div>
          <div className="flex items-center gap-3">
            {user?.role === 'admin' && (
              <Link 
                href="/users"
                className="px-5 py-2.5 bg-gray-50 text-gray-700 rounded-xl border border-gray-200 hover:bg-gray-100 hover:shadow-sm transition-all text-sm font-semibold flex items-center gap-2"
              >
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                Manage Users
              </Link>
            )}
            {(user?.role === 'admin' || user?.role === 'analyst') && (
              <Link 
                href="/records"
                className="px-5 py-2.5 bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 hover:shadow-sm transition-all text-sm font-semibold flex items-center gap-2"
              >
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                View Records
              </Link>
            )}
            {(user?.role === 'admin' || user?.role === 'viewer') && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 hover:shadow-md transition-all text-sm font-semibold flex items-center gap-2"
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add Record
              </button>
            )}
            <button 
              onClick={handleLogout}
              className="px-4 py-2.5 bg-gray-50 text-gray-600 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors text-sm font-semibold"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-emerald-400 to-emerald-600"></div>
            <h2 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Total Income</h2>
            <p className="text-4xl font-extrabold text-gray-900 tracking-tight">${summary?.totalIncome?.toFixed(2) || '0.00'}</p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-rose-400 to-rose-600"></div>
            <h2 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Total Expenses</h2>
            <p className="text-4xl font-extrabold text-gray-900 tracking-tight">${summary?.totalExpenses?.toFixed(2) || '0.00'}</p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-400 to-blue-600"></div>
            <h2 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Net Balance</h2>
            <p className={`text-4xl font-extrabold tracking-tight ${summary?.netBalance < 0 ? 'text-rose-600' : 'text-gray-900'}`}>
              {summary?.netBalance < 0 ? '-' : ''}${Math.abs(summary?.netBalance || 0).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Category Totals</h2>
            </div>
            <div className="p-5 text-sm space-y-3 max-h-64 overflow-y-auto">
              {categoryTotals.length === 0 ? (
                <p className="text-gray-500 font-medium">No category data.</p>
              ) : (categoryTotals.map((cat, idx) => (
                <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <span className="font-semibold text-gray-700">{cat.category} <span className="text-xs uppercase tracking-widest text-gray-400 ml-1">({cat.type})</span></span>
                  <span className={`font-bold ${cat.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>${cat.total.toFixed(2)}</span>
                </div>
              )))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Monthly Trends</h2>
            </div>
            <div className="p-5 text-sm space-y-3 max-h-64 overflow-y-auto">
              {trends.length === 0 ? (
                <p className="text-gray-500 font-medium">No trend data.</p>
              ) : (trends.map((t, idx) => (
                <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <span className="font-bold font-mono text-gray-600 tracking-tight">{t.month}</span>
                  <div className="flex gap-4 font-bold text-xs">
                    <span className="text-emerald-500 bg-emerald-50 px-2 py-1 rounded">+{t.income.toFixed(2)}</span>
                    <span className="text-rose-500 bg-rose-50 px-2 py-1 rounded">-{t.expense.toFixed(2)}</span>
                  </div>
                </div>
              )))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
          </div>
          {recentRecords.length === 0 ? (
            <div className="p-8 text-center text-gray-500 font-medium">No records found. Click "Add Record" to get started.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider font-semibold border-b border-gray-100">
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Category</th>
                    <th className="px-6 py-3">Notes</th>
                    <th className="px-6 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {recentRecords.map(record => (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-medium font-mono text-xs">
                        {new Date(record.record_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="bg-gray-100 text-gray-700 font-semibold px-3 py-1 rounded-full text-xs">
                          {record.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 truncate max-w-[200px]">
                        {record.notes || <span className="text-gray-300 italic">No notes</span>}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-right font-bold ${
                        record.type === 'income' ? 'text-emerald-500' : 'text-rose-500'
                      }`}>
                        {record.type === 'income' ? '+' : '-'}${parseFloat(record.amount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm transition-opacity p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all duration-300 scale-100 opacity-100">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Add New Record</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 hover:bg-gray-100 rounded-full p-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <form onSubmit={handleAddRecord} className="p-8 space-y-5">
              {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm mb-4 border border-red-100">{error}</div>}
              
              <div className="flex gap-4 p-1 bg-gray-100 rounded-xl w-full relative">
                <button type="button" onClick={() => setFormData({...formData, type: 'income'})} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${formData.type === 'income' ? 'bg-white shadow text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}>Income</button>
                <button type="button" onClick={() => setFormData({...formData, type: 'expense'})} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${formData.type === 'expense' ? 'bg-white shadow text-rose-600' : 'text-gray-500 hover:text-gray-700'}`}>Expense</button>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Amount</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-400 font-bold">$</span>
                  </div>
                  <input required type="number" step="0.01" min="0.01" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="block w-full pl-8 pr-4 py-3 bg-gray-50 border-gray-200 border rounded-xl text-gray-900 font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" placeholder="0.00" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
                <input required type="text" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="block w-full px-4 py-3 bg-gray-50 border-gray-200 border rounded-xl text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" placeholder="e.g. Salary, Groceries" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date</label>
                <input required type="date" value={formData.record_date} onChange={(e) => setFormData({...formData, record_date: e.target.value})} className="block w-full px-4 py-3 bg-gray-50 border-gray-200 border rounded-xl text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Notes (Optional)</label>
                <input type="text" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="block w-full px-4 py-3 bg-gray-50 border-gray-200 border rounded-xl text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" placeholder="Add some details..." />
              </div>

              <div className="pt-2">
                <button disabled={isSubmitting} type="submit" className="w-full bg-indigo-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-indigo-700 hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50">
                  {isSubmitting ? 'Saving...' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
