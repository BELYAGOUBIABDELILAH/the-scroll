
-- Create community testimonials table
CREATE TABLE public.community_testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.community_testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Testimonials are viewable by everyone"
ON public.community_testimonials FOR SELECT USING (true);

CREATE POLICY "Authenticated users can post testimonials"
ON public.community_testimonials FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own testimonials"
ON public.community_testimonials FOR DELETE
USING (auth.uid() = user_id);
