'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Unable to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-wrap" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <section className="section" style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ marginBottom: 16 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>
            Sign In
          </h1>
          <p style={{ marginTop: 6, fontSize: 13, color: 'var(--text-muted)' }}>
            Log in to continue to your finance dashboard
          </p>
        </div>

        {error ? (
          <div className="alert alert-error" style={{ marginBottom: 12 }}>
            {error}
          </div>
        ) : null}

        <form onSubmit={handleLogin} className="space-y-12">
          <div>
            <label className="label">Email Address</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="label">Password</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter password"
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ marginTop: 14, fontSize: 13, color: 'var(--text-muted)' }}>
          Don&apos;t have an account?{' '}
          <Link href="/signup" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Sign Up
          </Link>
        </p>
      </section>
    </main>
  );
}