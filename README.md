# Church Conference Registration System

A production-style Next.js App Router application for **OUR COVENANTAL HERITAGE** conference registration.

## Features

- Reverent/classical church-themed UI (parchment, sepia, serif)
- Mobile-first registration form with real-time validation
- Conditional field logic (plate number only when vehicle = Yes)
- Duplicate prevention (same full name + contact number)
- QR code generation after successful registration
- Admin dashboard (`/admin`) with:
  - Search (name/contact)
  - Vehicle filters
  - Attendance confirmation toggle (mark who will actually attend)
  - CSV export
- Automation hooks:
  - Registration webhook
  - Confirmation message simulation

## Tech Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- React Hook Form + Zod validation
- Supabase (PostgreSQL)

---

## 1) Install

```bash
npm install
```

## 2) Environment Variables

Copy `.env.example` into `.env.local` and set values:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
REGISTRATION_WEBHOOK_URL=... # optional
```

## 3) Database Setup (Supabase)

Open your Supabase SQL editor and run:

- `lib/sql-setup.sql`

This creates the `registrations` table (including `confirmed_attendance`) and duplicate-prevention unique index.

## 4) Run Locally

```bash
npm run dev
```

Open:

- User page: `http://localhost:3000`
- Admin page: `http://localhost:3000/admin`

---

## Vercel Deployment

1. Push project to GitHub
2. Import repository to Vercel
3. Add environment variables in Vercel project settings
4. Deploy

No extra build steps needed.

---

## Project Structure

```txt
/app
  /admin/page.tsx
  /api/register/route.ts
  /api/registrations/route.ts
  /api/registrations/export/route.ts
  /layout.tsx
  /page.tsx
/components
  Header.tsx
  HeroSection.tsx
  RegistrationForm.tsx
  FormField.tsx
  VehicleToggle.tsx
  AdminTable.tsx
/lib
  db.ts
  validation.ts
  sql-setup.sql
/types
  registration.ts
```
