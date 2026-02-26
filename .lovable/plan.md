

## "The Council" — Subscriber-Only Comment Section

### Database

**New table: `comments`**
- `id` (uuid, PK, default `gen_random_uuid()`)
- `scroll_id` (uuid, NOT NULL, FK → scrolls.id ON DELETE CASCADE)
- `user_id` (uuid, NOT NULL)
- `content` (text, NOT NULL)
- `created_at` (timestamptz, default `now()`)

**RLS policies:**
- SELECT: open to everyone (`true`) — comments are public
- INSERT: authenticated users only (`auth.uid() = user_id`) — must be logged in
- DELETE: own comments only (`auth.uid() = user_id`)

**Index:** on `(scroll_id, created_at)` for fast feed queries.

### New Component: `src/components/CouncilComments.tsx`

A self-contained component that receives `scrollId` and `authorId` as props, placed below the footer in `ScrollView.tsx`.

**Structure:**
- Serif heading: "The Council"
- **Input gate** (visible only if `user` is logged in): dark `#121212` textarea with `1px #27272A` border, placeholder "Share your thoughts with the realm...", Targaryen Red `#8B0000` submit button right-aligned
- If not logged in: subtle message "Sign in to join the discussion" with link to `/auth`
- **Comment feed**: flat vertical stack, each card is a bento-style card (`#0D0D0D` bg, `1px #1A1A1A` border)
  - Top row: circular avatar, bold name, relative timestamp (e.g. "2h ago")
  - Body: comment text in `#D4D4D8`
- **Author highlight**: if `comment.user_id === authorId`, apply a subtle red border (`1px solid #8B0000` with `box-shadow: 0 0 8px rgba(139,0,0,0.3)`) and an "Author" badge in `#8B0000` next to the name
- Uses `useQuery` to fetch comments joined with profiles, `useMutation` + `useQueryClient` for optimistic posting

### Integration into ScrollView

- Import and render `<CouncilComments scrollId={scroll.id} authorId={scroll.author_id} />` after the existing `<footer>` block, still inside the 700px container
- Only render when `canReadFull` is true (subscribers/authors only see comments)

### Implementation Steps

1. Create database migration for `comments` table with RLS
2. Build `CouncilComments.tsx` component with input gate, feed, and author highlighting
3. Integrate into `ScrollView.tsx` below the footer

