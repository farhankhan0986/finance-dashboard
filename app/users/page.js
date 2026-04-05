'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState(null);

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
    } else {
      router.push('/login');
      return;
    }

    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Failed to fetch users');
        }

        setUsers(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        setError(err.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [router]);

  const handleUpdateUser = async (id, field, value) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setError('');
    setUpdatingUserId(id);

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ [field]: value })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || `Failed to update ${field}`);
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, [field]: value } : u))
      );
    } catch (err) {
      setError(err.message || 'Update failed');
    } finally {
      setUpdatingUserId(null);
    }
  };

  if (loading) {
  return (
    <main className="page-wrap space-y-16">
      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 0.55; }
          50% { opacity: 1; }
          100% { opacity: 0.55; }
        }
        .skeleton {
          animation: pulse 1.4s ease-in-out infinite;
          background: #e5eaf0;
          border-radius: 4px;
        }
      `}</style>

      <section className="section">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div>
            <div className="skeleton" style={{ width: 170, height: 22, marginBottom: 8 }} />
            <div className="skeleton" style={{ width: 250, height: 13 }} />
          </div>
          <div className="skeleton" style={{ width: 150, height: 34 }} />
        </div>
      </section>

      <section className="section">
        <div className="skeleton" style={{ width: 70, height: 16, marginBottom: 12 }} />
        <div className="space-y-12">
          <div className="skeleton" style={{ height: 44, width: '100%' }} />
          <div className="skeleton" style={{ height: 44, width: '100%' }} />
          <div className="skeleton" style={{ height: 44, width: '100%' }} />
          <div className="skeleton" style={{ height: 44, width: '100%' }} />
          <div className="skeleton" style={{ height: 44, width: '100%' }} />
        </div>
      </section>
    </main>
  );
}

  if (error && users.length === 0) {
    return (
      <main className="page-wrap">
        <div className="alert alert-error">{error}</div>
      </main>
    );
  }

  return (
    <main className="page-wrap space-y-16">
      <section className="section">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>User Management</h1>
            <p className="muted" style={{ marginTop: 4 }}>
              Admin can manage role and status for all users
            </p>
          </div>

          <Link href="/dashboard" className="btn">
            Back to Dashboard
          </Link>
        </div>
      </section>

      {error ? <div className="alert alert-error">{error}</div> : null}

      <section className="section">
        <h2 className="section-title">Users</h2>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 200 }}>Name</th>
                <th style={{ width: 260 }}>Email</th>
                <th style={{ width: 150 }}>Role</th>
                <th style={{ width: 150 }}>Status</th>
                <th style={{ width: 140 }}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = u.id === currentUser?.id;
                const isUpdating = updatingUserId === u.id;

                return (
                  <tr key={u.id}>
                    <td>
                      <div className="row" style={{ gap: 8 }}>
                        <span style={{ fontWeight: 600 }}>{u.name}</span>
                        {isSelf ? <span className="badge">You</span> : null}
                      </div>
                    </td>

                    <td>{u.email}</td>

                    <td>
                      <select
                        className="select"
                        value={u.role}
                        onChange={(e) => handleUpdateUser(u.id, 'role', e.target.value)}
                        disabled={isUpdating}
                      >
                        <option value="admin">admin</option>
                        <option value="analyst">analyst</option>
                        <option value="viewer">viewer</option>
                      </select>
                    </td>

                    <td>
                      <select
                        className="select"
                        value={u.status}
                        onChange={(e) => handleUpdateUser(u.id, 'status', e.target.value)}
                        disabled={isUpdating}
                      >
                        <option value="active">active</option>
                        <option value="inactive">inactive</option>
                      </select>
                    </td>

                    <td>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}