
CREATE TABLE public.analytics_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text NOT NULL,
  scroll_id uuid REFERENCES public.scrolls(id) ON DELETE CASCADE,
  visitor_id text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert analytics events"
ON public.analytics_events
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Scribes can view analytics events"
ON public.analytics_events
FOR SELECT
USING (has_role(auth.uid(), 'scribe'::app_role));

CREATE INDEX idx_analytics_events_type_created ON public.analytics_events (event_type, created_at);
CREATE INDEX idx_analytics_events_scroll_id ON public.analytics_events (scroll_id);
