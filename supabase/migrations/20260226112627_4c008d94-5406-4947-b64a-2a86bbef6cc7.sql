
-- Create alliances table
CREATE TABLE public.alliances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scribe_id UUID NOT NULL,
  allied_user_id UUID NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (scribe_id, allied_user_id)
);

-- Enable RLS
ALTER TABLE public.alliances ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Alliances are viewable by everyone"
ON public.alliances FOR SELECT
USING (true);

-- Scribe can insert
CREATE POLICY "Scribes can create alliances"
ON public.alliances FOR INSERT
WITH CHECK (auth.uid() = scribe_id);

-- Scribe can update
CREATE POLICY "Scribes can update alliances"
ON public.alliances FOR UPDATE
USING (auth.uid() = scribe_id);

-- Scribe can delete
CREATE POLICY "Scribes can delete alliances"
ON public.alliances FOR DELETE
USING (auth.uid() = scribe_id);
