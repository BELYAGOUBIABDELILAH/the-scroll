

## Plan: Rebuild "The Scroll" as a Focused 3-Page Micro-Publishing Platform

This is a significant refactor that strips the current landing page of its generic marketing content and rebuilds the app around three tightly scoped pages, plus a new `scrolls` (posts) database table.

---

### Current State

**What exists:**
- Auth system with sign-in/sign-up/forgot-password (working)
- Database tables: `profiles`, `user_roles`, `subscriptions` with RLS
- Navbar with user display name, role badge, sign-out
- Landing page with mock scroll data and marketing sections
- Dark theme with Playfair Display + Inter fonts, fire/ember aesthetic

**What's missing:**
- No `scrolls` table (posts/articles)
- No reading view page
- No author dashboard / editor
- No real email capture (subscribe) flow
- Landing page is marketing-heavy, not publication-focused

---

### Database Migration

Create a `scrolls` table to store articles:

```sql
CREATE TABLE public.scrolls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  excerpt TEXT,
  is_sealed BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'draft',  -- 'draft' or 'published'
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.scrolls ENABLE ROW LEVEL SECURITY;

-- Anyone can read published scrolls
CREATE POLICY "Published scrolls are viewable by everyone"
  ON public.scrolls FOR SELECT USING (status = 'published');

-- Authors can see their own drafts
CREATE POLICY "Authors can view own drafts"
  ON public.scrolls FOR SELECT USING (auth.uid() = author_id);

-- Only scribes can insert
CREATE POLICY "Scribes can create scrolls"
  ON public.scrolls FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Authors can update their own scrolls
CREATE POLICY "Authors can update own scrolls"
  ON public.scrolls FOR UPDATE USING (auth.uid() = author_id);

-- Authors can delete their own scrolls
CREATE POLICY "Authors can delete own scrolls"
  ON public.scrolls FOR DELETE USING (auth.uid() = author_id);
```

---

### Page 1: Publication Landing Page (`/`)

**Refactor `src/pages/Index.tsx`** — strip marketing sections and rebuild as:

- **Header**: Simplified Navbar with logo + "Sign In" button (already exists, minor tweaks)
- **Hero Section**: Author avatar, name, 2-sentence bio, and an email-capture form (email input + "Pledge Fealty" button that inserts into `subscriptions` or a lightweight email list)
- **Scrolls Feed**: Bento grid of published scrolls fetched from the `scrolls` table. Each card shows title, publish date, 2-line excerpt, and a Sealed/Unsealed badge. Clicking navigates to the reading view.
- **Remove**: "How it works" section, mock data, generic CTA buttons

**Files:** `src/pages/Index.tsx` (rewrite)

---

### Page 2: Reading View (`/scroll/:id`)

**New page `src/pages/ScrollView.tsx`:**

- Back arrow to return to `/`
- Article header: large serif title, author name (from profiles), publish date
- Article body: render markdown content with clean typography (using a simple markdown-to-JSX renderer or manual parsing for H1, H2, bold, italics, blockquotes, lists)
- **Gating logic**: If `is_sealed` is true and user is not authenticated or not subscribed to the author, show only the first paragraph, then a blurred gradient fade-out with a "Subscribe to unseal this scroll" prompt

**Files:** `src/pages/ScrollView.tsx` (new)

---

### Page 3: Author Dashboard (`/dashboard`)

**New page `src/pages/Dashboard.tsx`:**

- Protected route — redirect to `/auth` if not authenticated
- Top tab navigation with three tabs: **Drafts**, **Published**, **Bannermen**
- "Write New Scroll" button opens the editor
- **Drafts tab**: List of user's draft scrolls with edit/delete actions
- **Published tab**: List of published scrolls with view/unpublish actions
- **Bannermen tab**: List of subscribers (from `subscriptions` table where `scribe_id = current user`)

**New page `src/pages/ScrollEditor.tsx`:**

- Clean, minimalist editor with:
  - Title input field
  - Large textarea for content (plain text / markdown)
  - Sealed/Unsealed toggle switch
  - "Dispatch" (publish) button with loading state
  - "Save Draft" button
- On publish: sets `status = 'published'` and `published_at = now()`

**Files:** `src/pages/Dashboard.tsx` (new), `src/pages/ScrollEditor.tsx` (new)

---

### Routing Updates

Update `src/App.tsx` to add:
- `/scroll/:id` → `ScrollView`
- `/dashboard` → `Dashboard` (protected)
- `/dashboard/write` → `ScrollEditor` (new scroll)
- `/dashboard/edit/:id` → `ScrollEditor` (edit existing)

---

### Navbar Updates

Update `src/components/Navbar.tsx`:
- For scribes: add a "Dashboard" link
- Simplify unauthenticated view to just "Sign In"

---

### Supporting Components

- `src/components/ScrollCard.tsx` — reusable card for the bento grid
- `src/components/MarkdownRenderer.tsx` — simple component to render markdown content as styled HTML (supports H1, H2, bold, italics, blockquotes, bullet points)
- `src/components/ProtectedRoute.tsx` — wrapper that redirects unauthenticated users

---

### Summary of All Files

| Action | File |
|--------|------|
| Migration | `scrolls` table + RLS policies |
| Rewrite | `src/pages/Index.tsx` |
| Rewrite | `src/components/Navbar.tsx` |
| Update | `src/App.tsx` |
| New | `src/pages/ScrollView.tsx` |
| New | `src/pages/Dashboard.tsx` |
| New | `src/pages/ScrollEditor.tsx` |
| New | `src/components/ScrollCard.tsx` |
| New | `src/components/MarkdownRenderer.tsx` |
| New | `src/components/ProtectedRoute.tsx` |

