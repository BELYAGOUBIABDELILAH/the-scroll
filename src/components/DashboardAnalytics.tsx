import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Mail, TrendingUp } from "lucide-react";

export const DashboardAnalytics = () => {
  const { user } = useAuth();

  // 1. Total Bannermen
  const { data: totalBannermen, isLoading: loadingBannermen } = useQuery({
    queryKey: ["analytics-bannermen", user?.id],
    queryFn: async () => {
      const [{ count: emailCount }, { count: subCount }] = await Promise.all([
        supabase.from("email_subscribers").select("*", { count: "exact", head: true }),
        supabase.from("subscriptions").select("*", { count: "exact", head: true }).eq("scribe_id", user!.id),
      ]);
      const total = (emailCount ?? 0) + (subCount ?? 0);

      // New this week
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      const [{ count: newEmail }, { count: newSub }] = await Promise.all([
        supabase.from("email_subscribers").select("*", { count: "exact", head: true }).gte("created_at", weekAgo),
        supabase.from("subscriptions").select("*", { count: "exact", head: true }).eq("scribe_id", user!.id).gte("created_at", weekAgo),
      ]);
      return { total, newThisWeek: (newEmail ?? 0) + (newSub ?? 0) };
    },
    enabled: !!user,
  });

  // 2. Latest Raven Open Rate
  const { data: openRate, isLoading: loadingOpen } = useQuery({
    queryKey: ["analytics-open-rate", user?.id],
    queryFn: async () => {
      const { data: latestScroll } = await supabase
        .from("scrolls")
        .select("id, title, published_at")
        .eq("author_id", user!.id)
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(1)
        .single();

      if (!latestScroll?.published_at) return null;

      const [{ count: scrollViews }, { count: pageViews }] = await Promise.all([
        supabase.from("analytics_events").select("*", { count: "exact", head: true })
          .eq("event_type", "scroll_view")
          .eq("scroll_id", latestScroll.id),
        supabase.from("analytics_events").select("*", { count: "exact", head: true })
          .eq("event_type", "page_view")
          .gte("created_at", latestScroll.published_at),
      ]);

      const views = pageViews ?? 0;
      const opens = scrollViews ?? 0;
      const rate = views > 0 ? Math.round((opens / views) * 100) : 0;

      return { rate, title: latestScroll.title, opens, views };
    },
    enabled: !!user,
  });

  // 3. Pledge Rate (this week)
  const { data: pledgeRate, isLoading: loadingPledge } = useQuery({
    queryKey: ["analytics-pledge-rate"],
    queryFn: async () => {
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      const [{ count: newPledges }, { count: weekViews }] = await Promise.all([
        supabase.from("email_subscribers").select("*", { count: "exact", head: true }).gte("created_at", weekAgo),
        supabase.from("analytics_events").select("*", { count: "exact", head: true })
          .eq("event_type", "page_view")
          .gte("created_at", weekAgo),
      ]);
      const pledges = newPledges ?? 0;
      const views = weekViews ?? 0;
      const rate = views > 0 ? ((pledges / views) * 100).toFixed(1) : "0";
      return { rate, pledges, views };
    },
    enabled: !!user,
  });

  return (
    <div className="mb-8 grid gap-4 sm:grid-cols-3">
      {/* Total Bannermen */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-3">
            <Users className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Total Bannermen</span>
          </div>
          {loadingBannermen ? (
            <Skeleton className="h-10 w-20" />
          ) : (
            <>
              <p className="font-serif text-4xl font-bold text-foreground">{totalBannermen?.total ?? 0}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                ▲ {totalBannermen?.newThisWeek ?? 0} this week
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Latest Raven Open Rate */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-3">
            <Mail className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Latest Raven Open Rate</span>
          </div>
          {loadingOpen ? (
            <Skeleton className="h-10 w-20" />
          ) : openRate ? (
            <>
              <p className="font-serif text-4xl font-bold text-foreground">{openRate.rate}%</p>
              <p className="mt-1 text-xs text-muted-foreground truncate" title={openRate.title}>
                "{openRate.title}"
              </p>
            </>
          ) : (
            <>
              <p className="font-serif text-4xl font-bold text-foreground">—</p>
              <p className="mt-1 text-xs text-muted-foreground">No published scrolls yet</p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Pledge Rate */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-3">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Pledge Rate (This Week)</span>
          </div>
          {loadingPledge ? (
            <Skeleton className="h-10 w-20" />
          ) : (
            <>
              <p className="font-serif text-4xl font-bold text-foreground">{pledgeRate?.rate}%</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {pledgeRate?.pledges} / {pledgeRate?.views} views
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
