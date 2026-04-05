'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token) {
      router.push('/login');
      return;
    }

    if (userStr) {
      const parsed = JSON.parse(userStr);
      setCurrentUser(parsed);
      if (parsed.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
    }

    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.message || 'Failed to fetch users');
        }

        setUsers(data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [router]);

  const handleUpdateUser = async (id, field, value) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ [field]: value })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Failed to update ${field}`);

      setUsers(prev => prev.map(u => u.id === id ? { ...u, [field]: value } : u));
    } catch (err) {
      alert(err.message);
    }
  };

  if (error) return <div className="p-8 text-rose-500">Error: {error}</div>;
  if (loading) return <div className="p-8 text-gray-500 flex justify-center items-center h-screen">Loading users...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">User Management</h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">Manage team members and access roles</p>
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

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider font-semibold border-b border-gray-100">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email Address</th>
                  <th className="px-6 py-4 text-center">Role</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-bold">
                      {u.name}
                      {u.id === currentUser?.id && <span className="ml-2 text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full uppercase tracking-widest">You</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-medium">
                      {u.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <select 
                        value={u.role}
                        onChange={(e) => handleUpdateUser(u.id, 'role', e.target.value)}
                        className={`font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider outline-none cursor-pointer hover:shadow-sm transition-all appearance-none text-center ${
                          u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                          u.role === 'analyst' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}
                      >
                        <option value="admin">Admin</option>
                        <option value="analyst">Analyst</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <select 
                        value={u.status}
                        onChange={(e) => handleUpdateUser(u.id, 'status', e.target.value)}
                        className={`font-semibold px-2.5 py-1 rounded-full text-[11px] uppercase tracking-wider outline-none cursor-pointer hover:shadow-sm transition-all appearance-none text-center ${
                          u.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-500 font-medium text-xs">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
