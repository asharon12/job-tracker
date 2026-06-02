# JobTracker

A personal full-stack web app for tracking job applications, interview rounds, and notifications. Installable as a PWA on mobile.

**Live app:** [job-tracker-mocha-eta.vercel.app](https://job-tracker-mocha-eta.vercel.app)

---

## Features

- Add and manage job applications with status, salary, location, referral info, and notes
- Inline status updates directly from the applications table
- Active / Archived tabs — Rejected and Ghosted applications move to the archive automatically
- Interview round tracking with scheduled dates and outcomes
- Calendar view of upcoming interviews
- In-app notifications — interview reminders (12h before) and referral follow-ups (48h after)
- Dashboard with pipeline funnel, weekly activity chart, and salary scatter chart
- Dark / Light mode
- Responsive layout with mobile bottom navigation
- Installable as a PWA from the browser

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite 7, TypeScript, Tailwind CSS v4 |
| State | TanStack React Query v5, Zustand v5 |
| Forms | React Hook Form |
| Charts | Recharts |
| Calendar | React Big Calendar |
| Backend | Node.js, Express 4, TypeScript |
| Database | PostgreSQL (Neon in prod, Homebrew locally) |
| ORM | Prisma v5 |
| Auth | JWT + bcryptjs |
| Validation | Zod |
| File upload | Cloudinary + Multer (wired, not in active UI) |
| Hosting | Vercel (frontend) + Render (backend) |

---

## Running Locally

### Prerequisites

- Node.js 22+
- PostgreSQL 16 via Homebrew — `brew services start postgresql@16`
- A local database: `createdb jobtracker`

### Backend

```bash
cd backend
cp .env.example .env   # fill in the values below
npx prisma db push
npm run dev            # starts on port 3001
```

**`backend/.env`**
```
DATABASE_URL=postgresql://<user>@localhost:5432/jobtracker
JWT_SECRET=any-long-random-string
JWT_EXPIRES_IN=7d
PORT=3001
CLIENT_URL=http://localhost:5174
```

### Frontend

```bash
cd frontend
npm install
npm run dev            # starts on port 5174
```

No frontend `.env` needed for local dev — Vite proxies `/api` to `localhost:3001` automatically.

---

## Project Structure

```
job-tracker/
├── backend/
│   ├── prisma/schema.prisma       # database schema
│   └── src/
│       ├── controllers/           # request handlers
│       ├── routes/                # express routers
│       ├── middleware/auth.ts     # JWT verification
│       └── lib/
│           ├── prisma.ts          # prisma client singleton
│           └── notifications.ts  # notification scheduling logic
└── frontend/
    └── src/
        ├── components/
        │   ├── applications/      # table, form, detail view
        │   ├── dashboard/         # charts and stat cards
        │   ├── layout/            # sidebar, navbar, bottom nav
        │   └── ui/                # modal, status badge
        ├── hooks/                 # react query hooks
        ├── pages/                 # route-level components
        ├── store/                 # zustand stores (auth, theme)
        └── lib/                   # fetch wrapper, date helpers
```

---

## Environment Variables (Production)

| Variable | Where | Notes |
|---|---|---|
| `DATABASE_URL` | Render | Neon pooler URL with `sslmode=require` |
| `JWT_SECRET` | Render | Long random string, never commit |
| `JWT_EXPIRES_IN` | Render | e.g. `7d` |
| `PORT` | Render | Injected automatically by Render |
| `CLIENT_URL` | Render | Your Vercel frontend URL (no trailing slash) |
| `VITE_API_URL` | Vercel | Your Render backend URL |
