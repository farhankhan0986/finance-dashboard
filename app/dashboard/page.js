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
  const [loading, setLoading] = useState(true);

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

    setLoading(true);
    setError('');

    try {
      const [resSummary, resActivity, resCategory, resTrends] = await Promise.all([
        fetch('/api/dashboard/summary', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/dashboard/recent-activity', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/dashboard/category-totals', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/dashboard/trends', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (
        resSummary.status === 401 ||
        resSummary.status === 403 ||
        resActivity.status === 401 ||
        resActivity.status === 403
      ) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
        return;
      }

      const summaryData = await resSummary.json();
      const activityData = await resActivity.json();
      const categoryData = await resCategory.json();
      const trendsData = await resTrends.json();

      if (!resSummary.ok) {
        throw new Error(summaryData.message || 'Failed to fetch summary');
      }

      setSummary(summaryData.data || null);
      setRecentRecords(activityData.data || []);
      setCategoryTotals(categoryData.data || []);
      setTrends(trendsData.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      router.push('/login');
      return;
    }

    setUser(JSON.parse(userStr));
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
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          amount: Number(formData.amount)
        })
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

      await fetchDashboard();
    } catch (err) {
      setError(err.message || 'Failed to add record');
    } finally {
      setIsSubmitting(false);
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
            <div style={{ width: 280 }}>
              <div className="skeleton" style={{ height: 24, width: 180, marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 14, width: 260 }} />
            </div>
            <div className="row">
              <div className="skeleton" style={{ height: 34, width: 120 }} />
              <div className="skeleton" style={{ height: 34, width: 120 }} />
              <div className="skeleton" style={{ height: 34, width: 120 }} />
            </div>
          </div>
        </section>

        <section>
          <div className="grid-3">
            <div className="stat-card">
              <div className="skeleton" style={{ height: 12, width: 90, marginBottom: 10 }} />
              <div className="skeleton" style={{ height: 28, width: 140 }} />
            </div>
            <div className="stat-card">
              <div className="skeleton" style={{ height: 12, width: 110, marginBottom: 10 }} />
              <div className="skeleton" style={{ height: 28, width: 140 }} />
            </div>
            <div className="stat-card">
              <div className="skeleton" style={{ height: 12, width: 95, marginBottom: 10 }} />
              <div className="skeleton" style={{ height: 28, width: 140 }} />
            </div>
          </div>
        </section>

        <section className="grid-2">
          <div className="section">
            <div className="skeleton" style={{ height: 18, width: 140, marginBottom: 14 }} />
            <div className="space-y-12">
              <div className="skeleton" style={{ height: 38, width: '100%' }} />
              <div className="skeleton" style={{ height: 38, width: '100%' }} />
              <div className="skeleton" style={{ height: 38, width: '100%' }} />
            </div>
          </div>

          <div className="section">
            <div className="skeleton" style={{ height: 18, width: 130, marginBottom: 14 }} />
            <div className="space-y-12">
              <div className="skeleton" style={{ height: 38, width: '100%' }} />
              <div className="skeleton" style={{ height: 38, width: '100%' }} />
              <div className="skeleton" style={{ height: 38, width: '100%' }} />
            </div>
          </div>
        </section>

        <section className="section">
          <div className="skeleton" style={{ height: 18, width: 120, marginBottom: 14 }} />
          <div className="space-y-12">
            <div className="skeleton" style={{ height: 40, width: '100%' }} />
            <div className="skeleton" style={{ height: 40, width: '100%' }} />
            <div className="skeleton" style={{ height: 40, width: '100%' }} />
          </div>
        </section>
      </main>
    );
  }

  if (error && !summary) {
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
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Dashboard</h1>
            <p className="muted" style={{ marginTop: 4 }}>
              Welcome, {user?.name} <span className="badge" style={{ marginLeft: 8 }}>{user?.role}</span>
            </p>
          </div>

          <div className="row">
            {user?.role === 'admin' ? (
              <Link href="/users" className="btn">
                Manage Users
              </Link>
            ) : null}

            {(user?.role === 'admin' || user?.role === 'analyst') ? (
              <Link href="/records" className="btn">
                View Records
              </Link>
            ) : null}

            {(user?.role === 'admin' || user?.role === 'viewer') ? (
              <button type="button" className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                Add Record
              </button>
            ) : null}

            <button type="button" className="btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </section>

      {error ? <div className="alert alert-error">{error}</div> : null}

      <section>
        <div className="grid-3">
          <div className="stat-card">
            <div className="stat-label">Total Income</div>
            <div className="stat-value">${Number(summary?.totalIncome || 0).toFixed(2)}</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Total Expenses</div>
            <div className="stat-value">${Number(summary?.totalExpenses || 0).toFixed(2)}</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Net Balance</div>
            <div
              className="stat-value"
              style={{ color: Number(summary?.netBalance || 0) < 0 ? 'var(--danger)' : 'var(--text)' }}
            >
              ${Math.abs(Number(summary?.netBalance || 0)).toFixed(2)}
              {Number(summary?.netBalance || 0) < 0 ? ' (negative)' : ''}
            </div>
          </div>
        </div>
      </section>

      <section className="grid-2">
        <div className="section">
          <h2 className="section-title">Category Totals</h2>
          {categoryTotals.length === 0 ? (
            <div className="muted">No category data.</div>
          ) : (
            <div className="space-y-12">
              {categoryTotals.map((cat, idx) => (
                <div key={idx} className="row" style={{ justifyContent: 'space-between' }}>
                  <div>
                    <strong>{cat.category}</strong>{' '}
                    <span className="muted" style={{ fontSize: 12 }}>({cat.type})</span>
                  </div>
                  <strong style={{ color: cat.type === 'income' ? 'var(--success)' : 'var(--danger)' }}>
                    ${Number(cat.total || 0).toFixed(2)}
                  </strong>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="section">
          <h2 className="section-title">Monthly Trends</h2>
          {trends.length === 0 ? (
            <div className="muted">No trend data.</div>
          ) : (
            <div className="space-y-12">
              {trends.map((t, idx) => (
                <div key={idx} className="row" style={{ justifyContent: 'space-between' }}>
                  <strong>{t.month}</strong>
                  <div className="row">
                    <span style={{ color: 'var(--success)', fontWeight: 600 }}>
                      +${Number(t.income || 0).toFixed(2)}
                    </span>
                    <span style={{ color: 'var(--danger)', fontWeight: 600 }}>
                      -${Number(t.expense || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Recent Activity</h2>
        {recentRecords.length === 0 ? (
          <div className="muted">No records yet.</div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 120 }}>Date</th>
                  <th style={{ width: 160 }}>Category</th>
                  <th>Notes</th>
                  <th style={{ width: 140, textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentRecords.map((record) => (
                  <tr key={record.id}>
                    <td>{new Date(record.record_date).toLocaleDateString()}</td>
                    <td>{record.category}</td>
                    <td>{record.notes || '-'}</td>
                    <td
                      style={{
                        textAlign: 'right',
                        fontWeight: 600,
                        color: record.type === 'income' ? 'var(--success)' : 'var(--danger)'
                      }}
                    >
                      {record.type === 'income' ? '+' : '-'}${Number(record.amount).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {isModalOpen ? (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.35)',
            display: 'grid',
            placeItems: 'center',
            padding: 16,
            zIndex: 50
          }}
        >
          <div className="section" style={{ width: '100%', maxWidth: 460 }}>
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Add New Record</h3>
              <button type="button" className="btn" onClick={() => setIsModalOpen(false)}>
                Close
              </button>
            </div>

            <form onSubmit={handleAddRecord} className="space-y-12">
              <div>
                <label className="label">Type</label>
                <select
                  className="select"
                  value={formData.type}
                  onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
                  required
                >
                  <option value="income">income</option>
                  <option value="expense">expense</option>
                </select>
              </div>

              <div>
                <label className="label">Amount</label>
                <input
                  className="input"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="label">Category</label>
                <input
                  className="input"
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="label">Date</label>
                <input
                  className="input"
                  type="date"
                  value={formData.record_date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, record_date: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="label">Notes</label>
                <input
                  className="input"
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Record'}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  );
}