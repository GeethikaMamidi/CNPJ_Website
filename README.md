# TechTatva — Event Management Dashboard

A clean, working prototype for managing event judging, winners, vendors, and mementos.

**Stack:** React + Vite · Tailwind CSS · Supabase

---

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free project.
2. Once the project is ready, go to **Settings → API** and copy:
   - **Project URL** (e.g. `https://xxxxx.supabase.co`)
   - **anon/public key**

### 2. Set Up the Database

1. In Supabase, go to **SQL Editor**.
2. Copy and run the contents of **`supabase/schema.sql`** — this creates all tables, views, and RLS policies.
3. Then copy and run **`supabase/seed.sql`** — this inserts clearly-labelled sample data.

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Install and Run

```bash
npm install
npm run dev
```

The app will start at `http://localhost:5173`.

---

## Project Structure

```
techtatva/
├── supabase/
│   ├── schema.sql          # Database schema (run first)
│   └── seed.sql            # Sample data (run second)
├── src/
│   ├── lib/supabase.js     # Supabase client
│   ├── components/
│   │   ├── Layout.jsx      # Sidebar + main layout
│   │   └── ui/             # Reusable UI components
│   ├── pages/
│   │   ├── Dashboard.jsx   # Stats overview
│   │   ├── Events.jsx      # CRUD for events
│   │   ├── Judges.jsx      # CRUD for judges
│   │   ├── Participants.jsx# CRUD for participants
│   │   ├── Judging.jsx     # Judging interface
│   │   ├── Results.jsx     # Auto-calculated rankings
│   │   ├── Vendors.jsx     # CRUD for vendors
│   │   └── Mementos.jsx    # CRUD for mementos
│   ├── App.jsx             # Router
│   ├── main.jsx            # Entry point
│   └── index.css           # Tailwind imports
├── .env.example
├── package.json
└── README.md
```

---

## Database Tables

| Table | Purpose |
|-------|---------|
| `events` | Event records (name, category, status) |
| `judges` | Judge records, linked to events |
| `participants` | Teams/participants, linked to events |
| `criteria` | Judging criteria per event (configurable) |
| `evaluations` | A judge's evaluation of a participant |
| `scores` | Individual criterion marks within an evaluation |
| `vendors` | Vendor contact and delivery tracking |
| `mementos` | Trophies, certificates, gifts tracking |
| `results_view` | Auto-calculated rankings (SQL view) |

---

## Features

- **Dashboard** — 8 stat cards, judging progress bars, memento status
- **Events** — Full CRUD with status badges
- **Judges** — Full CRUD with event assignment
- **Participants** — Full CRUD linked to events
- **Judging** — Select judge → event → evaluate participants with configurable criteria, marks validation, auto-totals, draft saving, submit with confirmation, read-only after submit, admin reopen
- **Results** — Auto-ranked from submitted evaluations, multi-judge averaging, gold/silver/bronze styling, individual judge score comparison
- **Vendors** — Full CRUD with payment/delivery status tracking
- **Mementos** — Full CRUD with auto-calculated pending quantities

---

## Sample Data

All sample data is clearly prefixed with "Sample" and uses placeholder names. It's designed to be easily deleted and replaced with actual TechTatva data.

To clear all sample data, run in Supabase SQL Editor:

```sql
DELETE FROM scores;
DELETE FROM evaluations;
DELETE FROM criteria;
DELETE FROM participants;
DELETE FROM judges;
DELETE FROM mementos;
DELETE FROM vendors;
DELETE FROM events;
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public API key |
