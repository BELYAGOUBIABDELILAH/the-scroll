import { supabase } from "@/integrations/supabase/client";

const VISITOR_KEY = "scroll_visitor_id";
const SESSION_KEY = "scroll_session_logged";

function getVisitorId(): string {
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

function hasLoggedThisSession(eventType: string, scrollId?: string): boolean {
  const key = `${SESSION_KEY}_${eventType}_${scrollId ?? "global"}`;
  if (sessionStorage.getItem(key)) return true;
  sessionStorage.setItem(key, "1");
  return false;
}

export async function trackPageView() {
  if (hasLoggedThisSession("page_view")) return;
  await supabase.from("analytics_events").insert({
    event_type: "page_view",
    visitor_id: getVisitorId(),
  });
}

export async function trackScrollView(scrollId: string) {
  if (hasLoggedThisSession("scroll_view", scrollId)) return;
  await supabase.from("analytics_events").insert({
    event_type: "scroll_view",
    scroll_id: scrollId,
    visitor_id: getVisitorId(),
  });
}
