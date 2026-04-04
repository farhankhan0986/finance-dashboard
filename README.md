# Finance Dashboard

This is a full-stack Next.js (App Router, JavaScript) + PostgreSQL project for a backend developer intern assignment. It provides a realistic backend system with role-based access control, financial record management, dashboard summary APIs, validation, and proper error handling.

## Setup Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   Configure your `.env` file (see the [Environment Variables](#environment-variables) section). The project comes with an `.env.example` file.

3. **Database Initialization**
   Create your PostgreSQL database (e.g. `finance_dashboard`), make sure your `.env` connection string is correct, and run:
   ```bash
   npm run db:init
   ```

4. **Seed Database**
   Seed the database with sample users and records:
   ```bash
   npm run db:seed
   ```

5. **Run the Server**
   ```bash
   npm run dev
   ```

## Environment Variables
- `DATABASE_URL`: PostgreSQL connection string. (e.g., `postgresql://postgres:postgres@localhost:5432/finance_dashboard`)
- `JWT_SECRET`: Secret key used for signing JWT tokens.
- `JWT_EXPIRES_IN`: Expiration time for tokens (default `1d`).

## Sample Credentials
- **Admin**: `admin@demo.com` / `Admin@123`
- **Analyst**: `analyst@demo.com` / `Analyst@123`
- **Viewer**: `viewer@demo.com` / `Viewer@123`

## API Endpoints

All protected endpoints require the header: `Authorization: Bearer <token>`.

### Authentication
- `POST /api/auth/login` (Public) - Login returns JWT

### Users
- `GET /api/users` (Admin) - List all users
- `POST /api/users` (Admin) - Create new user
- `GET /api/users/[id]` (Admin) - Get user by ID
- `PUT /api/users/[id]` (Admin) - Update user role/status 

### Records
- `GET /api/records` (Admin, Analyst, Viewer) - List records (with filtering: `type`, `category`, `startDate`, `endDate`, `page`, `limit`)
- `POST /api/records` (Admin, Analyst) - Create a record
- `GET /api/records/[id]` (Admin, Analyst, Viewer) - Get record by ID
- `PUT /api/records/[id]` (Admin, Analyst) - Update record
- `DELETE /api/records/[id]` (Admin, Analyst) - Delete record

### Dashboard
- `GET /api/dashboard/summary` (Admin, Analyst, Viewer) - Total income, expenses, and net balance
- `GET /api/dashboard/category-totals` (Admin, Analyst, Viewer) - Totals grouped by category
- `GET /api/dashboard/trends` (Admin, Analyst, Viewer) - Monthly income/expense trends
- `GET /api/dashboard/recent-activity` (Admin, Analyst, Viewer) - Latest records
- `GET /api/health` (Public) - Health check

## Technical Decisions & Trade-offs
- **Custom Auth over NextAuth/Libraries**: Given the requirements to not rely on large libraries and to use manual validation, `jsonwebtoken` with bearer tokens was implemented natively rather than pulling in external identity providers.
- **`pg` Direct Usage**: Kept abstraction minimal and used `pg` directly rather than an ORM to follow constraints.
- **Frontend Token Storage**: Used `localStorage` for the client to attach `Bearer <token>` directly per constraints, although `HttpOnly` cookies are typically safer for XSS resistance.

## Known Limitations
- Password reset logic is not implemented as it was out of scope.
- Pagination is implemented manually using offsets which won't perform well on multi-million row datasets (keyset pagination is preferred for scale).

## Assignment Mapping

| Requirement | Implementation |
| ----------- | -------------- |
| JavaScript (no TS), App Router | Full project adheres to this. Route handlers in `app/api/...` |
| pg (No Prisma) | `lib/db.js` provides a `Pool` wrapper. Used natively across APIs. |
| User and Role Management | `scripts/init.sql` schemas, `app/api/users/*` handlers. |
| Financial Records | `app/api/records/*` handlers. Implemented pagination and filters. |
| Dashboard Summary APIs | `app/api/dashboard/*` folders handling totals, categories, trends. |
| Access Control (RBAC) | `lib/guards.js` -> `withAuth(handler, ['roles'])` wrapper. |
| Validation & Error Handling | `lib/validate.js` and `lib/api.js` standardized responses. |
| Data Persistence (Seed/SQL) | `scripts/init.sql` and `scripts/seed.js`. NPM scripts provided. |
