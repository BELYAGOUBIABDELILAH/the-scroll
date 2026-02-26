import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { FeedCard } from "@/components/FeedCard";
import { Footer } from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Users } from "lucide-react";

const Feed = () => {
  const { user } = useAuth();

  // Get subscriptions
  const { data: subscriptions } = useQuery({
    queryKey: ["my-subscriptions", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("subscriptions")
        .select("scribe_id")
        .eq("subscriber_id", user!.id);
      return data ?? [];
    },
    enabled: !!user,
  });

  const scribeIds = subscriptions?.map((s) => s.scribe_id) ?? [];

  // Get feed posts from subscribed writers
  const { data: feedPosts, isLoading } = useQuery({
    queryKey: ["feed-posts", scribeIds],
    queryFn: async () => {
      if (!scribeIds.length) return [];
      const { data: scrolls } = await supabase
        .from("scrolls")
        .select("*")
        .eq("status", "published")
        .in("author_id", scribeIds)
        .order("published_at", { ascending: false })
        .limit(30);

      if (!scrolls?.length) return [];

      const authorIds = [...new Set(scrolls.map((s) => s.author_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", authorIds);

      const profileMap = new Map(
        (profiles ?? []).map((p) => [p.user_id, { name: p.display_name ?? "Anonymous", avatar: p.avatar_url }])
      );

      return scrolls.map((s) => ({
        ...s,
        author_name: profileMap.get(s.author_id)?.name ?? "Anonymous",
        author_avatar: profileMap.get(s.author_id)?.avatar ?? null,
      }));
    },
    enabled: scribeIds.length > 0,
  });

  // Get subscribed writers profiles
  const { data: writers } = useQuery({
    queryKey: ["subscribed-writers", scribeIds],
    queryFn: async () => {
      if (!scribeIds.length) return [];
      const { data } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url, bio")
        .in("user_id", scribeIds);
      return data ?? [];
    },
    enabled: scribeIds.length > 0,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 pt-24 pb-16">
        <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Your Feed</h1>
        <p className="text-muted-foreground mb-8">Latest from writers you follow.</p>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main feed */}
          <div className="lg:col-span-2 space-y-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-xl" />
              ))
            ) : feedPosts && feedPosts.length > 0 ? (
              feedPosts.map((post) => (
                <FeedCard
                  key={post.id}
                  id={post.id}
                  title={post.title}
                  excerpt={post.excerpt}
                  is_sealed={post.is_sealed}
                  published_at={post.published_at}
                  author_name={post.author_name}
                  author_id={post.author_id}
                  author_avatar={post.author_avatar}
                  tag={post.tag}
                />
              ))
            ) : (
              <div className="rounded-xl border border-border bg-card p-12 text-center">
                <Users className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
                <h3 className="font-serif text-lg font-semibold text-foreground mb-2">No posts yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Follow some writers to see their latest posts here.
                </p>
                <Link
                  to="/"
                  className="inline-flex items-center rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Discover Writers
                </Link>
              </div>
            )}
          </div>

          {/* Subscriptions sidebar */}
          <aside>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Your Subscriptions
            </h3>
            <div className="space-y-3">
              {writers?.map((w) => (
                <Link
                  key={w.user_id}
                  to={`/scribe/${w.user_id}`}
                  className="flex items-center gap-3 rounded-lg border border-transparent p-3 transition-colors hover:border-border hover:bg-card"
                >
                  {w.avatar_url ? (
                    <img src={w.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground">
                      {(w.display_name ?? "A")[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground">{w.display_name ?? "Anonymous"}</p>
                    {w.bio && <p className="text-xs text-muted-foreground line-clamp-1">{w.bio}</p>}
                  </div>
                </Link>
              ))}
              {(!writers || writers.length === 0) && (
                <p className="text-sm text-muted-foreground">You haven't subscribed to anyone yet.</p>
              )}
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Feed;
