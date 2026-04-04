'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const router = useRouter();

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

    const fetchDashboard = async () => {
      try {
        const res = await fetch('/api/dashboard/summary', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/login');
          return;
        }

        if (!res.ok) {
          throw new Error(data.message || 'Failed to fetch summary');
        }

        setSummary(data.data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchDashboard();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;
  if (!summary) return <div className="p-8 text-gray-500 flex justify-center items-center h-screen">Loading dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-white p-4 rounded shadow border border-gray-100">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-sm text-gray-500">Welcome, {user?.name} ({user?.role})</p>
          </div>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition text-sm font-medium"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded shadow border-t-4 border-green-500">
            <h2 className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Total Income</h2>
            <p className="text-3xl font-bold text-gray-800 mt-2">${summary.totalIncome.toFixed(2)}</p>
          </div>
          <div className="bg-white p-6 rounded shadow border-t-4 border-red-500">
            <h2 className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Total Expenses</h2>
            <p className="text-3xl font-bold text-gray-800 mt-2">${summary.totalExpenses.toFixed(2)}</p>
          </div>
          <div className="bg-white p-6 rounded shadow border-t-4 border-blue-500">
            <h2 className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Net Balance</h2>
            <p className="text-3xl font-bold text-gray-800 mt-2">${summary.netBalance.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
