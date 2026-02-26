

## Bento Grid Analytics for the Author Dashboard

### The Problem
The dashboard currently has no analytics. Writers need key metrics to understand their audience at a glance.

### What We Will Build
A 3-panel bento grid displayed above the existing tabs on the Dashboard page, showing three focused metrics:

```text
┌─────────────────┬─────────────────┬─────────────────┐
│  Total Active   │  Latest Raven   │  Pledge Rate    │
│  Bannermen      │  Open Rate      │  (This Week)    │
│                 │                 │                 │
│  47             │  62%            │  8.3%           │
│  ▲ 3 this week  │  "Scroll Title" │  12 / 145 views │
└─────────────────┴─────────────────┴─────────────────┘
```

### Data Strategy

We need to track two things we currently cannot: page views and scroll opens. This requires a new database table.

**New table: `analytics_events`**
- `id` (uuid, PK)
- `event_type` (text) — values: `page_view`, `scroll_view`
- `scroll_id` (uuid, nullable) — links to the scroll for `scroll_view` events
- `created_at` (timestamptz)
- `visitor_id` (text) — anonymous fingerprint (random ID stored in localStorage, no auth needed)

**RLS policies:**
- INSERT: open to everyone (anonymous visitors must be able to log events)
- SELECT: restricted to scribes only (only the author sees their metrics)

**Metric calculations (all client-side queries):**
1. **Total Bannermen** — `COUNT(email_subscribers) + COUNT(subscriptions)` from existing tables
2. **Latest Raven Open Rate** — find the most recently published scroll, count its `scroll_view` events, divide by total `page_view` events since that scroll's publish date. Show the scroll title as subtitle.
3. **Pledge Rate (this week)** — count `email_subscribers` created in the last 7 days, divide by `page_view` events in the last 7 days

### Implementation Steps

1. **Database migration** — Create the `analytics_events` table with RLS policies and an index on `(event_type, created_at)` for fast weekly queries.

2. **Event tracking on the Landing Page (`Index.tsx`)** — On mount, log a `page_view` event using a stable `visitor_id` from localStorage. Deduplicate by only logging once per session.

3. **Event tracking on the Reading View (`ScrollView.tsx`)** — On mount, log a `scroll_view` event with the scroll's ID.

4. **New component: `DashboardAnalytics.tsx`** — A 3-panel bento grid using the existing Card components. Each panel shows the metric value, a label, and a contextual subtitle. Uses three `useQuery` hooks to fetch the computed metrics. Displays skeleton loaders while loading.

5. **Integrate into Dashboard** — Render `<DashboardAnalytics />` between the page header and the tab bar.

### Technical Details

- The `visitor_id` is a random UUID generated once and stored in `localStorage` under `scroll_visitor_id`. It is not tied to authentication — it simply prevents double-counting the same browser session.
- Event logging uses `supabase.from("analytics_events").insert(...)` with no auth required (anon insert policy).
- All metric queries filter by the scribe's own data using their published scroll IDs and subscriber tables.
- The bento cards use `font-serif` for the large number, `text-muted-foreground` for labels, matching the existing dashboard aesthetic.

