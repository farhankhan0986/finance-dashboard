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

    setError('');
    setLoading(true);

    try {
      const queryParams = new URLSearchParams({
        page: String(page),
        limit: '10',
        ...(type && { type }),
        ...(category && { category }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(userId && { userId })
      });

      const res = await fetch(`/api/records?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch records');
      }

      setRecords(data?.data?.records || []);
      setMeta(data?.data?.meta || null);
    } catch (err) {
      setError(err.message || 'Failed to load records');
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

    if (!userStr) {
      router.push('/login');
      return;
    }

    const parsed = JSON.parse(userStr);
    setUser(parsed);

    if (parsed.role === 'viewer') {
      router.push('/dashboard');
      return;
    }

    fetchRecords();
  }, [router, fetchRecords]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`/api/records/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || 'Failed to delete record');
      }

      await fetchRecords();
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  const clearFilters = () => {
    setType('');
    setCategory('');
    setStartDate('');
    setEndDate('');
    setUserId('');
    setUserNameFilter('');
    setPage(1);
  };

  if (loading && records.length === 0) {
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
            <div className="skeleton" style={{ width: 190, height: 22, marginBottom: 8 }} />
            <div className="skeleton" style={{ width: 300, height: 13 }} />
          </div>
          <div className="skeleton" style={{ width: 150, height: 34 }} />
        </div>
      </section>

      <section className="section">
        <div className="grid-4">
          <div className="skeleton" style={{ height: 36, width: '100%' }} />
          <div className="skeleton" style={{ height: 36, width: '100%' }} />
          <div className="skeleton" style={{ height: 36, width: '100%' }} />
          <div className="skeleton" style={{ height: 36, width: '100%' }} />
        </div>
      </section>

      <section className="section">
        <div className="skeleton" style={{ width: 80, height: 16, marginBottom: 12 }} />
        <div className="space-y-12">
          <div className="skeleton" style={{ height: 44, width: '100%' }} />
          <div className="skeleton" style={{ height: 44, width: '100%' }} />
          <div className="skeleton" style={{ height: 44, width: '100%' }} />
          <div className="skeleton" style={{ height: 44, width: '100%' }} />
        </div>
      </section>
    </main>
  );
}

  if (error && records.length === 0 && !loading) {
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
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Financial Records</h1>
            <p className="muted" style={{ marginTop: 4 }}>
              Review and filter transactions
            </p>
          </div>
          <Link href="/dashboard" className="btn">
            Back to Dashboard
          </Link>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Filters</h2>

        <div className="grid-4">
          <div>
            <label className="label">Type</label>
            <select
              className="select"
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All</option>
              <option value="income">income</option>
              <option value="expense">expense</option>
            </select>
          </div>

          <div>
            <label className="label">Category</label>
            <input
              className="input"
              type="text"
              placeholder="e.g. Salary"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div>
            <label className="label">From date</label>
            <input
              className="input"
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div>
            <label className="label">To date</label>
            <input
              className="input"
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        <div className="row" style={{ marginTop: 10, justifyContent: 'space-between' }}>
          <div>
            {userId ? (
              <span className="badge">
                User filter: {userNameFilter || userId}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setUserId('');
                    setUserNameFilter('');
                    setPage(1);
                  }}
                  style={{ marginLeft: 8, cursor: 'pointer', border: 0, background: 'transparent' }}
                >
                  ×
                </button>
              </span>
            ) : null}
          </div>

          <button type="button" className="btn" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>
      </section>

      {error ? <div className="alert alert-error">{error}</div> : null}

      <section className="section">
        <h2 className="section-title">Records</h2>

        {loading && records.length === 0 ? (
          <div className="muted">Loading records...</div>
        ) : records.length === 0 ? (
          <div className="muted">No records found for current filters.</div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 120 }}>Date</th>
                  <th style={{ width: 180 }}>Author</th>
                  <th style={{ width: 100 }}>Type</th>
                  <th style={{ width: 160 }}>Category</th>
                  <th>Notes</th>
                  <th style={{ width: 140, textAlign: 'right' }}>Amount</th>
                  {user?.role === 'admin' ? (
                    <th style={{ width: 110, textAlign: 'center' }}>Actions</th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id}>
                    <td>{new Date(r.record_date).toLocaleDateString()}</td>

                    <td>
                      {r.users?.name ? (
                        <button
                          type="button"
                          onClick={() => {
                            setUserId(String(r.created_by));
                            setUserNameFilter(r.users.name);
                            setPage(1);
                          }}
                          style={{
                            border: 0,
                            background: 'transparent',
                            padding: 0,
                            color: 'var(--primary)',
                            cursor: 'pointer',
                            fontWeight: 600
                          }}
                          title="Filter by this user"
                        >
                          {r.users.name}
                        </button>
                      ) : (
                        '-'
                      )}
                    </td>

                    <td>
                      <span className={`badge ${r.type === 'income' ? 'badge-success' : 'badge-danger'}`}>
                        {r.type}
                      </span>
                    </td>

                    <td>{r.category}</td>
                    <td>{r.notes || '-'}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      {r.type === 'income' ? '+' : '-'}${Number(r.amount).toFixed(2)}
                    </td>

                    {user?.role === 'admin' ? (
                      <td style={{ textAlign: 'center' }}>
                        <button type="button" className="btn btn-danger" onClick={() => handleDelete(r.id)}>
                          Delete
                        </button>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {meta ? (
          <div className="row" style={{ marginTop: 12, justifyContent: 'space-between' }}>
            <div className="muted">
              Showing {(meta.page - 1) * meta.limit + 1} to {Math.min(meta.page * meta.limit, meta.total)} of{' '}
              {meta.total}
            </div>
            <div className="row">
              <button
                type="button"
                className="btn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Prev
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= meta.totalPages}
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}