'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Records() {
  const [records, setRecords] = useState([]);
  const [meta, setMeta] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [page, setPage] = useState(1);
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [userId, setUserId] = useState('');
  const [userNameFilter, setUserNameFilter] = useState('');

  const router = useRouter();

  const fetchRecords = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page,
        limit: 10,
        ...(type && { type }),
        ...(category && { category }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(userId && { userId })
      });

      const res = await fetch(`/api/records?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Failed to fetch records');

      setRecords(data.data.records || []);
      setMeta(data.data.meta);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, type, category, startDate, endDate, userId]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token) {
      router.push('/login');
      return;
    }

    if (userStr) {
      const parsed = JSON.parse(userStr);
      setUser(parsed);
      // Viewers are not allowed to access this global list as per updated roles.
      // Wait, Analyst and Admin CAN access this.
      if (parsed.role === 'viewer') {
         router.push('/dashboard');
         return;
      }
    }

    fetchRecords();
  }, [router, fetchRecords]);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/records/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete record');
      }
      fetchRecords();
    } catch (err) {
      alert(err.message);
    }
  };

  if (error && records.length === 0) return <div className="p-8 text-rose-500">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Financial Records</h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">Browse, filter, and analyze all transactions</p>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              href="/dashboard"
              className="px-5 py-2.5 bg-gray-50 text-gray-600 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors text-sm font-semibold flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Type</label>
            <select value={type} onChange={e => {setType(e.target.value); setPage(1)}} className="w-40 border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
               <option value="">All Types</option>
               <option value="income">Income</option>
               <option value="expense">Expense</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Category</label>
            <input type="text" placeholder="Search category..." value={category} onChange={e => {setCategory(e.target.value); setPage(1)}} className="w-48 border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">From Date</label>
            <input type="date" value={startDate} onChange={e => {setStartDate(e.target.value); setPage(1)}} className="w-40 border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">To Date</label>
            <input type="date" value={endDate} onChange={e => {setEndDate(e.target.value); setPage(1)}} className="w-40 border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
          </div>
          {userId && (
            <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-2 rounded-lg text-sm font-bold border border-indigo-100">
              User: {userNameFilter}
              <button 
                onClick={() => {setUserId(''); setUserNameFilter(''); setPage(1);}}
                className="hover:bg-indigo-200 rounded-full p-0.5 transition-colors"
                title="Clear user filter"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
          )}
          <div className="ml-auto flex gap-2">
            <button onClick={() => {setType(''); setCategory(''); setStartDate(''); setEndDate(''); setUserId(''); setUserNameFilter(''); setPage(1);}} className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors">Clear Filters</button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading && records.length === 0 ? (
             <div className="p-8 text-center text-gray-500 font-medium">Loading data...</div>
          ) : records.length === 0 ? (
             <div className="p-8 text-center text-gray-500 font-medium">No records found. Try adjusting your filters.</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider font-semibold border-b border-gray-100">
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Author</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Notes</th>
                      <th className="px-6 py-4 text-right">Amount</th>
                      {user?.role === 'admin' && <th className="px-6 py-4 text-center">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-sm">
                    {records.map(r => (
                      <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-medium font-mono text-xs">
                          {new Date(r.record_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {r.users ? (
                            <button 
                              onClick={() => {setUserId(r.created_by); setUserNameFilter(r.users.name); setPage(1);}}
                              className="font-bold text-gray-700 hover:text-indigo-600 hover:underline transition-colors focus:outline-none"
                              title="Click to view all records by this user"
                            >
                              {r.users.name}
                            </button>
                          ) : (
                            <span className="text-gray-400 font-medium italic">Unknown</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`font-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-wider ${r.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            {r.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-700">
                          {r.category}
                        </td>
                        <td className="px-6 py-4 text-gray-500 truncate max-w-[200px]">
                          {r.notes || <span className="text-gray-300 italic">No notes</span>}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-right font-bold ${r.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {r.type === 'income' ? '+' : '-'}${parseFloat(r.amount).toFixed(2)}
                        </td>
                        {user?.role === 'admin' && (
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <button onClick={() => handleDelete(r.id)} className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">Delete</button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {meta && (
                <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Showing {(meta.page - 1) * meta.limit + 1} to {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} records
                  </span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setPage(p => Math.max(1, p - 1))} 
                      disabled={page === 1}
                      className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-bold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Prev
                    </button>
                    <button 
                      onClick={() => setPage(p => p + 1)} 
                      disabled={page >= meta.totalPages}
                      className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-bold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
