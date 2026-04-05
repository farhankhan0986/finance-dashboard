import Link from 'next/link';

export default function Home() {
  return (
    <main className="page-wrap" style={{ minHeight: '100vh', display: 'grid', alignItems: 'center' }}>
      <section className="section" style={{ width: '100%', maxWidth: 980, margin: '0 auto', padding: 28 }}>
        <div className="grid-2" style={{ alignItems: 'center', gap: 24 }}>
          <div>
            <p
              style={{
                margin: 0,
                display: 'inline-block',
                border: '1px solid var(--border)',
                padding: '4px 10px',
                borderRadius: 4,
                fontSize: 12,
                color: 'var(--text-muted)',
                background: '#fff'
              }}
            >
              Finance Data Processing & Access Control
            </p>

            <h1 style={{ margin: '14px 0 0', fontSize: 36, lineHeight: 1.2, fontWeight: 700, color: 'var(--text)' }}>
              Finance Dashboard Backend
            </h1>

            <p style={{ marginTop: 14, marginBottom: 0, color: 'var(--text-muted)', maxWidth: 560, fontSize: 15 }}>
              A role-based finance system where users can add and review records, analysts can explore trends and
              insights, and admins can manage users and platform access with clear authorization controls.
            </p>

            <div className="row" style={{ marginTop: 20 }}>
              <Link href="/login" className="btn btn-primary">
                Sign In
              </Link>
              <Link href="/signup" className="btn">
                Create Account
              </Link>
            </div>
          </div>

          <div className="section" style={{ margin: 0, padding: 16 }}>
            <h2 className="section-title" style={{ marginBottom: 10 }}>
              What this system provides
            </h2>
            <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--text-muted)', lineHeight: 1.8 }}>
              <li>Role-based access control for admin, analyst, and viewer.</li>
              <li>Financial record creation, filtering, and tracking.</li>
              <li>Dashboard analytics: income, expense, net balance, trends.</li>
              <li>User management with role and status controls.</li>
              <li>Secure API access using token-based authentication.</li>
            </ul>
          </div>
        </div>

        <div className="grid-3" style={{ marginTop: 18 }}>
          <div className="stat-card">
            <div className="stat-label">User Roles</div>
            <div className="stat-value" style={{ fontSize: 18 }}>
              Admin · Analyst · Viewer
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Core Modules</div>
            <div className="stat-value" style={{ fontSize: 18 }}>
              Users · Records · Dashboard
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">API Design</div>
            <div className="stat-value" style={{ fontSize: 18 }}>
              Validation + RBAC + Errors
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}