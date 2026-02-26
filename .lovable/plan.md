

## Plan: Substack-Inspired Redesign

This is a large overhaul touching the landing page, footer, filtering, and dashboards. I will break it into focused tasks.

### What Changes (Substack-inspired patterns)

**1. Landing Page Overhaul**
- **Hero**: Simplify to a cleaner, more Substack-like hero with a prominent tagline, shorter subtitle, and a single orange/primary CTA button ("Get started") + a secondary "Learn more" link. Remove the email input from hero (move subscription to other sections).
- **Social-proof bar**: Add a row of small stats below the hero (e.g. "10K+ writers", "1M+ readers") like Substack's trust indicators.
- **Personalized feed section**: Rename "The Great Hall" to a Substack-style "Recommended" or "Popular on The Scroll" feed. Show cards with author avatar, name, post title, excerpt, like/comment counts, and a Subscribe button per author -- matching Substack's card layout.
- **Categories/Topics navigation**: Add a horizontal scrollable topic bar (like Substack's "Culture", "Politics", "Technology" etc.) above the feed, replacing the current Chronicles filter placement. Make it more prominent.
- **"Up next" sidebar**: On desktop, add a right sidebar with recommended posts (like Substack's "Up next" panel), showing title + author + read time.
- **Reorder sections**: Hero -> Topic bar + Feed (2-column with sidebar) -> How It Works -> Testimonials -> CTA -> Footer

**2. Enhanced Footer**
- Multi-column footer with: About, Product links, Resources, Legal columns
- Social media icons row
- Newsletter signup embedded in footer
- "The Scroll" branding with tagline

**3. Improved Filtering**
- Replace current pill-style filter with a more prominent horizontal tab bar with icons
- Add a search input at the top of the feed
- Add sort options (Latest, Popular, Trending)

**4. Dashboard Improvements (Writer/Scribe)**
- Add a welcome header with the writer's name and quick stats summary
- Improve the scrolls list with thumbnail previews, engagement metrics (views, comments) inline
- Add a "Quick actions" row: New Scroll, View Profile, Share Profile
- Better empty states with illustrations/guidance
- Add a simple line chart for subscriber growth over time (using recharts, already installed)

**5. Dashboard for Readers (Bannerman view)**
- Currently no reader dashboard exists. Add a `/feed` route for logged-in readers showing their subscribed writers' latest scrolls
- Add a "My Subscriptions" section showing followed writers

### Technical Approach

**Files to create:**
- `src/components/TopicBar.tsx` -- horizontal scrollable category navigation
- `src/components/FeedCard.tsx` -- Substack-style post card with avatar, title, excerpt, engagement
- `src/components/RecommendedSidebar.tsx` -- "Up next" sidebar panel
- `src/components/Footer.tsx` -- full multi-column footer component
- `src/components/SubscriberChart.tsx` -- recharts line chart for dashboard
- `src/pages/Feed.tsx` -- reader feed page

**Files to modify:**
- `src/pages/Index.tsx` -- major restructure: new layout, topic bar, 2-column feed + sidebar
- `src/pages/Dashboard.tsx` -- enhanced header, stats, quick actions, chart, better list items
- `src/components/Navbar.tsx` -- add search input, update nav links
- `src/components/DashboardSidebar.tsx` -- minor polish
- `src/components/ScrollCard.tsx` -- restyle to match Substack post cards (bigger, with engagement)
- `src/App.tsx` -- add `/feed` route

**Key design decisions:**
- Keep the dark theme but adopt Substack's content-first layout: generous whitespace, clean typography, prominent author avatars
- Feed cards get larger with more metadata (read time, like count, comment count)
- 2-column layout on desktop for the main feed (content left, recommendations right)
- Footer becomes a proper 4-column grid with useful links

### Implementation Order
1. Create Footer component
2. Create TopicBar component  
3. Create FeedCard component (Substack-style post card)
4. Create RecommendedSidebar component
5. Redesign Index.tsx landing page layout
6. Enhance Dashboard.tsx with chart, quick actions, better lists
7. Add reader Feed page + route
8. Update Navbar with search

