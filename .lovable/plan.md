

## Pro Reading View Redesign

### Changes

**1. `src/pages/ScrollView.tsx` — Full rewrite of the reading view**

- Set background to `#080808` explicitly
- Max-width container: `700px` centered
- **Header**: Massive Playfair Display serif title, metadata row with circular author avatar, name, date, and computed reading time (~200 words/min), all in `#A1A1AA`
- **Body**: Inter sans-serif, `leading-[1.7]`, max-w `700px`
- **Gate**: Show first TWO paragraphs (not one), CSS gradient fade to `#080808`, then a bento-style card with 1px border:
  - Serif header: "S'abonner pour lire la suite"
  - Email input + `#8B0000` "S'abonner" button (free subscription via `email_subscribers` table insert)
  - No lock icon, no mention of price
- **Footer**: Minimal — share link (copy URL to clipboard) + "Retour" link back to landing page

**2. `src/components/MarkdownRenderer.tsx` — Update typography**

- Paragraphs: `leading-[1.7]` instead of `leading-relaxed`
- Text color: `text-[#E5E5E5]` for body text
- Headings: keep serif, increase spacing

**3. Reading time utility**

- Add a `getReadingTime(content: string)` helper inline in ScrollView (word count / 200, round up, return `"X min read"`)

### Implementation Steps

1. Add reading time calculation to ScrollView
2. Redesign ScrollView header with avatar, metadata row, reading time
3. Update gate to show 2 paragraphs + email capture form with French copy + `#8B0000` accent
4. Add minimal footer with share button and back link
5. Refine MarkdownRenderer typography for premium line height

