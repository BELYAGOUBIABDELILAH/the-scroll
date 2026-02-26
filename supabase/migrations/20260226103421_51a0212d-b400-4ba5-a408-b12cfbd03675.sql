
CREATE TABLE public.scrolls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  excerpt TEXT,
  is_sealed BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'draft',
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

-- Trigger for updated_at
CREATE TRIGGER update_scrolls_updated_at
  BEFORE UPDATE ON public.scrolls
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
