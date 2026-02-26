import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { DashboardAnalytics } from "@/components/DashboardAnalytics";
import { AllianceManager } from "@/components/AllianceManager";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Feather, Trash2, Eye, EyeOff, Mail, Users, Handshake } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

type Tab = "drafts" | "published" | "bannermen" | "alliances";

const Dashboard = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("drafts");
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  // Fetch email subscribers
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

  const tabs: { key: Tab; label: string }[] = [
    { key: "drafts", label: "Drafts" },
    { key: "published", label: "Published" },
    { key: "bannermen", label: "Bannermen" },
    { key: "alliances", label: "Alliances" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-4xl px-6 pt-24 pb-16">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="font-serif text-3xl font-bold text-foreground">Dashboard</h1>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/80" asChild>
            <Link to="/dashboard/write">
              <Feather className="mr-2 h-4 w-4" />
              Write New Scroll
            </Link>
          </Button>
        </div>

        {/* Analytics Bento Grid */}
        <DashboardAnalytics />

        {/* Tabs */}
        <div className="mb-8 flex gap-1 rounded-lg border border-border bg-secondary p-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                tab === t.key
                  ? "bg-background text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Drafts */}
        {tab === "drafts" && (
          <div className="space-y-3">
            {drafts?.length === 0 && (
              <p className="py-12 text-center text-muted-foreground">No drafts yet.</p>
            )}
            {drafts?.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
              >
                <div>
                  <Link
                    to={`/dashboard/edit/${d.id}`}
                    className="font-serif font-semibold text-foreground hover:text-primary transition-colors"
                  >
                    {d.title || "Untitled"}
                  </Link>
                  <p className="text-xs text-muted-foreground mt-1">
                    Updated {format(new Date(d.updated_at), "MMM d, yyyy")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {d.is_sealed && (
                    <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary text-xs">
                      Sealed
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate(d.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Published */}
        {tab === "published" && (
          <div className="space-y-3">
            {published?.length === 0 && (
              <p className="py-12 text-center text-muted-foreground">No published scrolls.</p>
            )}
            {published?.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
              >
                <div>
                  <Link
                    to={`/scroll/${p.id}`}
                    className="font-serif font-semibold text-foreground hover:text-primary transition-colors"
                  >
                    {p.title}
                  </Link>
                  <p className="text-xs text-muted-foreground mt-1">
                    Published {p.published_at && format(new Date(p.published_at), "MMM d, yyyy")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {p.is_sealed && (
                    <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary text-xs">
                      Sealed
                    </Badge>
                  )}
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/scroll/${p.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => unpublishMutation.mutate(p.id)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <EyeOff className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bannermen */}
        {tab === "bannermen" && (
          <div className="space-y-6">
            {/* Email Subscribers */}
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
                  <div
                    key={s.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
                  >
                    <span className="font-medium text-foreground">{s.email}</span>
                    <span className="text-xs text-muted-foreground">
                      Pledged {format(new Date(s.created_at), "MMM d, yyyy")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Account Subscribers */}
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
                  <div
                    key={b.subscriber_id}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
                  >
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

        {/* Alliances */}
        {tab === "alliances" && <AllianceManager />}
      </div>
    </div>
  );
};

export default Dashboard;
