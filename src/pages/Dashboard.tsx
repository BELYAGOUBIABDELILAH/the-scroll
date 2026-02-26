import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardSidebar, SIDEBAR_MARGIN } from "@/components/DashboardSidebar";
import { DashboardAnalytics } from "@/components/DashboardAnalytics";
import { SubscriberChart } from "@/components/SubscriberChart";
import { AllianceManager } from "@/components/AllianceManager";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Eye, EyeOff, Mail, Users, PenLine, User, Share2, FileText } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

type Tab = "drafts" | "published" | "bannermen" | "alliances";

const Dashboard = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("drafts");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ["my-profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", user!.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  const { data: drafts } = useQuery({
    queryKey: ["my-drafts", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("scrolls")
        .select("*")
        .eq("author_id", user!.id)
        .eq("status", "draft")
        .order("updated_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: published } = useQuery({
    queryKey: ["my-published", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("scrolls")
        .select("*")
        .eq("author_id", user!.id)
        .eq("status", "published")
        .order("published_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: bannermen } = useQuery({
    queryKey: ["my-bannermen", user?.id],
    queryFn: async () => {
      const { data: subs } = await supabase
        .from("subscriptions")
        .select("subscriber_id, created_at")
        .eq("scribe_id", user!.id);
      if (!subs?.length) return [];
      const ids = subs.map((s) => s.subscriber_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", ids);
      const profileMap = new Map(
        (profiles ?? []).map((p) => [p.user_id, p.display_name ?? "Unknown"])
      );
      return subs.map((s) => ({
        ...s,
        display_name: profileMap.get(s.subscriber_id) ?? "Unknown",
      }));
    },
    enabled: !!user,
  });

  const { data: emailSubs } = useQuery({
    queryKey: ["email-subscribers"],
    queryFn: async () => {
      const { data } = await supabase
        .from("email_subscribers")
        .select("*")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("scrolls").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-drafts"] });
      queryClient.invalidateQueries({ queryKey: ["my-published"] });
      toast({ title: "Scroll destroyed" });
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("scrolls")
        .update({ status: "draft", published_at: null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-drafts"] });
      queryClient.invalidateQueries({ queryKey: ["my-published"] });
      toast({ title: "Scroll unpublished" });
    },
  });

  const displayName = profile?.display_name ?? user?.email?.split("@")[0] ?? "Scribe";

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar activeTab={tab} onTabChange={(t) => setTab(t as Tab)} />

      <main className={`flex-1 px-6 py-8 pt-16 md:pt-8 ${SIDEBAR_MARGIN}`}>
        {/* Welcome header */}
        <div className="mb-6">
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Welcome back, {displayName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {tab === "drafts" && `You have ${drafts?.length ?? 0} drafts`}
            {tab === "published" && `${published?.length ?? 0} published scrolls`}
            {tab === "bannermen" && `${(emailSubs?.length ?? 0) + (bannermen?.length ?? 0)} total subscribers`}
            {tab === "alliances" && "Manage your alliances"}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 flex flex-wrap gap-3">
          <Button asChild size="sm" className="gap-2">
            <Link to="/dashboard/write">
              <PenLine className="h-4 w-4" />
              New Scroll
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="gap-2" asChild>
            <Link to={`/scribe/${user?.id}`}>
              <User className="h-4 w-4" />
              View Profile
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/scribe/${user?.id}`);
              toast({ title: "Profile link copied!" });
            }}
          >
            <Share2 className="h-4 w-4" />
            Share Profile
          </Button>
        </div>

        {/* Metrics */}
        <DashboardAnalytics />

        {/* Subscriber Chart */}
        <div className="mb-8">
          <SubscriberChart />
        </div>

        {/* Tab content */}
        {tab === "drafts" && (
          <div className="space-y-3">
            {drafts?.length === 0 && (
              <div className="rounded-xl border border-border bg-card p-12 text-center">
                <FileText className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                <h3 className="font-serif text-lg font-semibold text-foreground mb-2">No drafts yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Start writing your first scroll.</p>
                <Button asChild size="sm">
                  <Link to="/dashboard/write">Write Your First Scroll</Link>
                </Button>
              </div>
            )}
            {drafts?.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/20"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/dashboard/edit/${d.id}`}
                    className="font-serif font-semibold text-foreground hover:text-primary transition-colors"
                  >
                    {d.title || "Untitled"}
                  </Link>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>Updated {format(new Date(d.updated_at), "MMM d, yyyy")}</span>
                    {d.tag && d.tag !== "general" && (
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-xs capitalize">{d.tag}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {d.is_sealed && (
                    <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary text-xs">
                      Sealed
                    </Badge>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(d.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "published" && (
          <div className="space-y-3">
            {published?.length === 0 && (
              <div className="rounded-xl border border-border bg-card p-12 text-center">
                <Eye className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                <h3 className="font-serif text-lg font-semibold text-foreground mb-2">No published scrolls</h3>
                <p className="text-sm text-muted-foreground">Your published works will appear here.</p>
              </div>
            )}
            {published?.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/20"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/scroll/${p.id}`}
                    className="font-serif font-semibold text-foreground hover:text-primary transition-colors"
                  >
                    {p.title}
                  </Link>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>Published {p.published_at && format(new Date(p.published_at), "MMM d, yyyy")}</span>
                    {p.tag && p.tag !== "general" && (
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-xs capitalize">{p.tag}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {p.is_sealed && (
                    <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary text-xs">
                      Sealed
                    </Badge>
                  )}
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/scroll/${p.id}`}><Eye className="h-4 w-4" /></Link>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => unpublishMutation.mutate(p.id)} className="text-muted-foreground hover:text-foreground">
                    <EyeOff className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "bannermen" && (
          <div className="space-y-6">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Mail className="h-4 w-4" />
                Email Subscribers ({emailSubs?.length ?? 0})
              </div>
              {emailSubs?.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">No email subscribers yet.</p>
              )}
              <div className="space-y-2">
                {emailSubs?.map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
                    <span className="font-medium text-foreground">{s.email}</span>
                    <span className="text-xs text-muted-foreground">
                      Pledged {format(new Date(s.created_at), "MMM d, yyyy")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Users className="h-4 w-4" />
                Account Subscribers ({bannermen?.length ?? 0})
              </div>
              {bannermen?.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">No account subscribers yet.</p>
              )}
              <div className="space-y-2">
                {bannermen?.map((b) => (
                  <div key={b.subscriber_id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
                    <span className="font-medium text-foreground">{b.display_name}</span>
                    <span className="text-xs text-muted-foreground">
                      Pledged {format(new Date(b.created_at), "MMM d, yyyy")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "alliances" && <AllianceManager />}
      </main>
    </div>
  );
};

export default Dashboard;
