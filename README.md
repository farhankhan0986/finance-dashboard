# Finance Dashboard

This is a full-stack Next.js (App Router, JavaScript) + Supabase project for a complete finance dashboard. It provides a secure, role-based backend architecture layered with a modern UI for generating rapid financial insights, updating metadata, and tracking transaction flow.

- **Live Demo**: [finance-dashboard-gamma-orpin.vercel.app](https://finance-dashboard-gamma-orpin.vercel.app/)
- **Postman API Docs**: [View Collection](https://documenter.getpostman.com/view/47279076/2sBXiqEUUZ)

## Core Stack
- **Frontend**: Next.js (App Router), React, TailwindCSS
- **Backend / API**: Next.js API Routes, Node.js
- **Database / ORM**: PostgreSQL via `@supabase/supabase-js`
- **Security**: Native JWT stateless authentication and strictly enforced API RBAC

## Setup Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   Configure your `.env` file carefully. The project relies on Supabase.
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   JWT_SECRET=your_custom_jwt_secret
   ```

3. **Database Initialization**
   Instead of running a local script, open your Supabase SQL Editor and execute the schema provided in:
   - `scripts/init.sql` (Creates users, records logic, and initial seeding if needed)
   - `scripts/dashboard_rpc.sql` (**CRITICAL**: Creates the performant server-side functions explicitly scoped to handle the dashboard RBAC matrix).

4. **Run the Server**
   ```bash
   npm run dev
   ```

## Authorization Matrix (RBAC)

The system rigorously enforces three roles across both backend endpoints and frontend UI elements.

**1. `admin` (Full Control)**
- Full system control.
- Can create, read, update, delete all financial records.
- Can create, list, view, and patch all users.
- Can access global dashboard analytics.

**2. `analyst` (Global Read-Only / Insight Role)**
- Read-focused finance access.
- Can read/list and heavily filter all global financial records.
- Can access full Dashboard Analytics (Summary, Trends, Categories, Recent Activity).
- **Cannot** modify or create records.
- **Cannot** view the user management listing or arbitrarily update users. 

**3. `viewer` (Limited Contributor Role)**
- Data-scoped contributor logic.
- Can input new personal records (`POST`).
- **Scoped Read**: Dashboard summaries, trends, and record lists visually lock down to return *only* data matching their personal user ID.
- **Cannot** view global aggregates or global records.

## API Endpoints

All protected endpoints require the header: `Authorization: Bearer <token>`.

### Authentication
- `POST /api/auth/signup` (Public) - Create a new account with a default role
- `POST /api/auth/login` (Public) - Authenticate and return JWT

### Users
- `GET /api/users` (Admin) - List all users
- `POST /api/users` (Admin) - Force-create new user
- `GET /api/users/[id]` (Admin) - Get user by ID
- `PATCH /api/users/[id]` (Admin) - Seamlessly update user role/status 

### Records
- `GET /api/records` (Admin, Analyst, Viewer) - Paged global data (Viewers automatically scoped)
- `POST /api/records` (Admin, Viewer) - Insert a record
- `GET /api/records/[id]` (Admin, Analyst, Viewer) - Get singular record by ID
- `PATCH /api/records/[id]` (Admin) - Update record (Admins only)
- `DELETE /api/records/[id]` (Admin) - Delete record (Admins only)

### Dashboard (Powered by SQL RPC)
*(Note: Viewers accessing these endpoints implicitly trigger scoped logic via `p_user_id` context)*
- `GET /api/dashboard/summary` (Admin, Analyst, Viewer) - Total income, expenses, and net 
- `GET /api/dashboard/category-totals` (Admin, Analyst, Viewer) - Totals grouped by category
- `GET /api/dashboard/trends` (Admin, Analyst, Viewer) - 12-month rolling trends
- `GET /api/dashboard/recent-activity` (Admin, Analyst, Viewer) - Latest records
- `GET /api/health` (Public) - Health check

## Technical Decisions and Trade-offs

I built this project to prioritize speed, simplicity, and security over heavy abstractions. Here is a breakdown of the core decisions and trade-offs I made along the way.

**1. Framework: Next.js App Router vs. Traditional Split Stack**
I went with the Next.js App Router because having the frontend and backend in a single repo significantly speeds up building the UI alongside the API. I avoided server actions for the main data operations to keep a clean, traditional REST API layer (`/api/...`) so that the backend could theoretically be consumed by a mobile app or third-party client down the line without massive rewrites.

**2. Database & ORM: Supabase + Raw SQL vs. Prisma**
Instead of reaching for Prisma or Drizzle, I used the native `@supabase/supabase-js` client and wrote raw PostgreSQL functions for the heavy lifting.
*Trade-off*: Writing raw SQL (`LANGUAGE plpgsql` functions for dashboard analytics) takes more time upfront than using an ORM. However, it's a massive performance win. Rather than fetching thousands of records into Node.js memory just to tally up a "Total Income" or "Category Trend," the database computes the exact totals and hands Next.js a clean, tiny JSON response. 

**3. Authentication: Custom JWT stateless auth vs. Auth0/NextAuth**
I deliberately coded a custom JWT-based authentication system rather than dropping in a heavy library like NextAuth.js or Auth0. 
*Why?* The constraints of the project required three highly specific roles (`admin`, `analyst`, `viewer`). By owning the JWT generation and verification, I could build a custom middleware (`withAuth`) that strictly enforces this Role-Based Access Control (RBAC) exactly how I needed it. 
*Trade-off*: Managing things like refresh tokens and password resets will require manual implementation later, whereas a managed auth provider handles that out of the box. I also used `localStorage` for the client token to get things moving fast, though migrating to `HttpOnly` cookies would be better to prevent XSS down the line.

**4. Architecture: The "Viewer" Data Scope Strategy**
Handling the `viewer` role (where a user can only see data they inserted) was tricky. Initially, I just filtered data on the Next.js side. 
*Decision*: I ripped this out and moved the filtering directly into the DB layer using the PostgreSQL `p_user_id` context. This means even if the Next.js handler accidentally requests global data, the SQL query inherently blocks a Viewer from retrieving another user's financial records. It’s a defense-in-depth approach that makes the dashboard analytics virtually leak-proof.

## Security & Architecture Notes
- **Supabase RPC Optimization**: Instead of fetching thousands of records and looping over them in Node.js to build `summary` or `trends`, standard logic is baked cleanly into PostgreSQL functions using `LANGUAGE plpgsql`. The backend simply passes the user payload (`p_role`, `p_user_id`) down to the DB to act as the ultimate source of truth.
- **JWT Protection**: The entire App Router API uses a specialized `withAuth(['roleA', 'roleB'])` decorator mapped to `lib/guards.js`. Returning structured `403 Forbidden` messages if boundaries are crossed.
