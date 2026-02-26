

# The Scroll — Exclusive Micro-Publishing Platform

## Vision
A dark, cinematic micro-publishing platform inspired by House of the Dragon. Writers publish "Scrolls" to their "Bannermen" (subscribers) in an ultra-minimalist, obsidian-dark interface with blood-red Targaryen accents.

---

## Phase 1: Design System & Landing Page

### Dark "Modern Westeros" Theme
- Obsidian/near-black backgrounds with subtle grayscale layering
- Targaryen blood-red (`hsl(0, 72%, 45%)`) for all primary CTAs
- Typography: elegant serif for headings (e.g., Playfair Display), clean sans-serif for body
- Subtle border treatments and card surfaces with very low-contrast grays

### Landing Page
- Dramatic hero section with tagline: *"Seal your words. Send your ravens."*
- Brief explanation of the platform concept
- "Enter the Keep" (Sign Up) and "Read the Scrolls" CTAs
- Featured/recent public scrolls in a bento grid layout
- Dark, immersive atmosphere throughout

---

## Phase 2: Authentication & Profiles (Supabase)

### Auth System
- Sign up / Sign in pages styled as "Entering the Keep"
- Email + password authentication
- Role selection on signup: **Scribe** (writer) or **Bannerman** (reader)

### Profiles Table
- Display name, bio, avatar, role (scribe/bannerman)
- Writer profile pages showing their published scrolls in a bento grid
- "Pledge Fealty" (follow/subscribe) button on writer profiles

### Subscriptions Table
- Track which bannermen follow which scribes
- Follower counts displayed on writer profiles

---

## Phase 3: The Editor & Publishing

### Markdown Editor (for Scribes)
- Distraction-free, full-screen writing experience
- Markdown support with live preview
- Clean typography — headings, bold, italic, links, blockquotes
- No clutter, no formatting ribbons

### Publishing Flow
- Title, content, and seal status: **Unsealed** (public) or **Sealed** (account-required)
- Cover image option (optional)
- "Send the Raven" publish button
- Scrolls stored in Supabase with markdown content

---

## Phase 4: Reading Experience

### Public Feed
- Browse all unsealed scrolls in a dark bento grid
- Filter by scribe or recency

### Individual Scroll View
- Elegant, full-width reading layout with premium typography
- Sealed scrolls show a teaser paragraph with a "Create an account to unseal" prompt
- Author info card with follow button

### Reader Dashboard
- "My Ravens" — feed of new scrolls from followed scribes
- Reading history

---

## Phase 5: Writer Dashboard

### Scribe's Keep (Dashboard)
- List of published and draft scrolls
- Bannerman count and basic stats
- Quick access to the editor

---

## Pages Summary
1. **Landing** — Hero + featured scrolls
2. **Auth** — Sign in / Sign up
3. **Feed** — Browse all public scrolls
4. **Scroll View** — Read individual scroll
5. **Writer Profile** — Scribe's public page with their scrolls
6. **Editor** — Write/edit scrolls (scribes only)
7. **Dashboard** — Scribe's private management area
8. **Reader Dashboard** — Bannerman's personalized feed

