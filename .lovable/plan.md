

## Chronicles Navigation & Filtered Grid

### Current State
The `scrolls` table has no `tag` or `category` column. The feed on `Index.tsx` renders all published scrolls in a flat list with no filtering. The `ScrollEditor.tsx` has no tag selection UI either.

### Database Migration

Add a `tag` column to the `scrolls` table:

```sql
ALTER TABLE public.scrolls ADD COLUMN tag text NOT NULL DEFAULT 'general';
```

No new RLS policies needed — existing policies on `scrolls` already cover this column.

### New Component: `src/components/ChroniclesFilter.tsx`

**Props:** `tags: string[]`, `activeTag: string`, `onTagChange: (tag: string) => void`

- Horizontal scrollable row (`overflow-x-auto`, hidden scrollbar via `scrollbar-hide` utility)
- Pills rendered as buttons:
  - **Default:** no background, `#71717A` text, `text-sm` sans-serif, `px-3 py-1.5` rounded-full
  - **Active:** `#18181B` background, `#FFFFFF` text, `1px solid #27272A` border
- First pill is always "All" (clears filter)
- Transition on pill state: `transition-all duration-150`

### Changes to `Index.tsx`

1. Add `activeTag` state (default `"All"`)
2. Extract unique tags from fetched scrolls to build the pill list
3. Place `ChroniclesFilter` between the "Publications" heading and the article list
4. Filter `scrolls` client-side by `activeTag` (if not "All")
5. Wrap the grid in `AnimatePresence` with a keyed `motion.div` using `opacity` transition (200ms ease-in-out) so cards cross-fade when the tag changes
6. Replace section heading "Publications" with "Chronicles"

### Changes to `ScrollEditor.tsx`

1. Add a tag input/select field below the title (simple text input or small preset pill selector)
2. Include `tag` in both insert and update calls
3. Load existing tag when editing

### Implementation Steps

1. Run database migration to add `tag` column to `scrolls`
2. Build `ChroniclesFilter` component with pill menu styling
3. Update `Index.tsx` — add filter state, render `ChroniclesFilter`, apply client-side filtering with cross-fade animation
4. Update `ScrollEditor.tsx` — add tag field to editor, persist on save/dispatch

