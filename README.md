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
  - CSV export
- Automation hooks:
  - Registration webhook
  - Optional Google Sheets sync webhook
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
SUPABASE_SERVICE_ROLE_KEY=...
REGISTRATION_WEBHOOK_URL=... # optional
GOOGLE_SHEETS_WEBHOOK_URL=... # optional
```

## 3) Database Setup (Supabase)

Open your Supabase SQL editor and run:

- `lib/sql-setup.sql`

This creates the `registrations` table and duplicate-prevention unique index.

## 4) Run Locally

```bash
npm run dev
```

Open:

- User page: `http://localhost:3000`
- Admin page: `http://localhost:3000/admin`

---

## Google Sheets Sync (Optional)

Set `GOOGLE_SHEETS_WEBHOOK_URL` to an Apps Script Web App endpoint that accepts JSON and appends rows.

### Example Apps Script (`doPost`)

```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.openById('YOUR_SHEET_ID').getSheetByName('Registrations');
  const data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    data.id,
    data.fullName,
    data.contactNumber,
    data.email || '',
    data.church,
    data.hasVehicle ? 'Yes' : 'No',
    data.plateNumber || '',
    data.createdAt,
  ]);

  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

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
