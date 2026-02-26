
CREATE TABLE public.email_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT email_subscribers_email_unique UNIQUE (email)
);

ALTER TABLE public.email_subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe (insert)
CREATE POLICY "Anyone can subscribe"
  ON public.email_subscribers FOR INSERT
  WITH CHECK (true);

-- Only authenticated scribes can view subscribers
CREATE POLICY "Scribes can view subscribers"
  ON public.email_subscribers FOR SELECT
  USING (public.has_role(auth.uid(), 'scribe'));
