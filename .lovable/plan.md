

## Alliances Widget + Pledge Alliance Modal

### Database

**New table: `alliances`**
- `id` (uuid, PK, default `gen_random_uuid()`)
- `scribe_id` (uuid, NOT NULL) — the author who curates this alliance
- `allied_user_id` (uuid, NOT NULL) — the allied author's user_id
- `description` (text, NOT NULL, default `''`) — 3-word tagline (e.g. "Strategy & Lore")
- `display_order` (integer, NOT NULL, default `0`)
- `created_at` (timestamptz, default `now()`)

**RLS policies:**
- SELECT: public (`true`)
- INSERT/UPDATE/DELETE: scribe only (`auth.uid() = scribe_id`)

**Unique constraint:** `(scribe_id, allied_user_id)`

### Component 1: `src/components/AlliancesWidget.tsx`

Props: `scribeId: string`

- Queries `alliances` table joined with `profiles` (for name, avatar) filtered by `scribe_id`, ordered by `display_order`
- Renders a bento box: obsidian `#080808` bg, `1px #1A1A1A` border, rounded
- Heading: serif "Alliances" in `#A1A1AA`
- Each row: grayscale circular avatar (CSS `filter: grayscale(100%)`), name in white sans-serif, 3-word description in `#71717A`
- Entire row is a subtle hover link (`#121212` bg on hover) — links to `/` (since there's no per-author page yet, or could be a no-op anchor)

**Placement:** Rendered on `Index.tsx` below the scrolls feed, before the footer, inside the 700px container.

### Component 2: `src/components/PledgeAllianceModal.tsx`

Props: `scribeId: string`, `open: boolean`, `onClose: () => void`

- Uses Radix Dialog with glassmorphic overlay (`backdrop-filter: blur(12px)`, semi-transparent dark bg)
- Bento card center: `#0D0D0D` bg, `1px #1A1A1A` border
- Serif header: "Your raven has been dispatched. Expand your network."
- Lists the 3 allied authors with checkboxes (default checked), avatar + name
- Red `#8B0000` button: "Add to Subscriptions" — bulk-inserts into `subscriptions` table for each checked ally
- Gray text link: "No thanks, enter the archives." — closes modal

**Trigger logic:** In both `Index.tsx` (handleSubscribe) and `ScrollView.tsx` (handleSubscribe), after a successful email subscription, open the modal by setting state. The modal only shows if alliances exist for the scribe.

### Integration Points

1. **`Index.tsx`**: Add `AlliancesWidget` before footer. After successful subscribe, show `PledgeAllianceModal`.
2. **`ScrollView.tsx`**: After successful subscribe in the gate form, show `PledgeAllianceModal`.

### Implementation Steps

1. Create database migration for `alliances` table with RLS
2. Build `AlliancesWidget.tsx` — bento box with grayscale avatars and hover rows
3. Build `PledgeAllianceModal.tsx` — glassmorphic dialog with checkboxes and bulk subscribe
4. Integrate widget into `Index.tsx` and trigger modal on subscription in both `Index.tsx` and `ScrollView.tsx`

