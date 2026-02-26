import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Flame, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const FeaturedWriters = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const { data: writers } = useQuery({
    queryKey: ["featured-writers"],
    queryFn: async () => {
      // Get all scribes
      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "scribe");
      if (!roles?.length) return [];

      const scribeIds = roles.map((r) => r.user_id);

      // Get profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url, bio")
        .in("user_id", scribeIds);

      // Get subscriber counts
      const { data: subs } = await supabase
        .from("subscriptions")
        .select("scribe_id")
        .in("scribe_id", scribeIds);
      const subMap: Record<string, number> = {};
      (subs ?? []).forEach((s) => {
        subMap[s.scribe_id] = (subMap[s.scribe_id] ?? 0) + 1;
      });

      // Get post counts
      const { data: scrolls } = await supabase
        .from("scrolls")
        .select("author_id")
        .eq("status", "published")
        .in("author_id", scribeIds);
      const postMap: Record<string, number> = {};
      (scrolls ?? []).forEach((s) => {
        postMap[s.author_id] = (postMap[s.author_id] ?? 0) + 1;
      });

      // Get trending posts (latest per writer)
      const { data: latestScrolls } = await supabase
        .from("scrolls")
        .select("id, title, author_id, excerpt, published_at")
        .eq("status", "published")
        .in("author_id", scribeIds)
        .order("published_at", { ascending: false })
        .limit(20);

      // Get one latest post per writer
      const latestPostMap = new Map<string, { id: string; title: string; excerpt: string | null }>();
      (latestScrolls ?? []).forEach((s) => {
        if (!latestPostMap.has(s.author_id)) {
          latestPostMap.set(s.author_id, { id: s.id, title: s.title, excerpt: s.excerpt });
        }
      });

      return (profiles ?? [])
        .map((p) => ({
          ...p,
          subscribers: subMap[p.user_id] ?? 0,
          posts: postMap[p.user_id] ?? 0,
          latestPost: latestPostMap.get(p.user_id) ?? null,
        }))
        .sort((a, b) => b.subscribers - a.subscribers || b.posts - a.posts);
    },
  });

  const updateScrollButtons = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -340 : 340, behavior: "smooth" });
    setTimeout(updateScrollButtons, 400);
  };

  if (!writers?.length) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-8 flex items-end justify-between"
      >
        <div>
          <h2 className="mb-1 font-serif text-3xl font-bold text-foreground">Featured Writers</h2>
          <p className="text-sm text-muted-foreground">Discover voices shaping the realm.</p>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="rounded-full border border-border p-2 text-muted-foreground transition-colors hover:text-foreground hover:border-foreground/30 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="rounded-full border border-border p-2 text-muted-foreground transition-colors hover:text-foreground hover:border-foreground/30 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </motion.div>

      <div
        ref={scrollRef}
        onScroll={updateScrollButtons}
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
      >
        {writers.map((writer, i) => (
          <motion.div
            key={writer.user_id}
            custom={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
            className="w-[300px] shrink-0 snap-start rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
          >
            {/* Writer info */}
            <Link
              to={`/scribe/${writer.user_id}`}
              className="mb-4 flex items-center gap-3 group"
            >
              <Avatar className="h-12 w-12 ring-2 ring-border">
                {writer.avatar_url ? (
                  <AvatarImage src={writer.avatar_url} alt={writer.display_name ?? ""} />
                ) : null}
                <AvatarFallback className="bg-secondary text-sm font-bold text-secondary-foreground">
                  {(writer.display_name ?? "A")[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-serif font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                  {writer.display_name ?? "Anonymous"}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{writer.subscribers} subscribers</span>
                  <span>·</span>
                  <span>{writer.posts} posts</span>
                </div>
              </div>
            </Link>

            {/* Bio */}
            {writer.bio && (
              <p className="mb-4 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                {writer.bio}
              </p>
            )}

            {/* Latest post */}
            {writer.latestPost && (
              <Link
                to={`/scroll/${writer.latestPost.id}`}
                className="group/post block rounded-lg bg-secondary/50 p-3 transition-colors hover:bg-secondary"
              >
                <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Flame className="h-3 w-3 text-primary" />
                  <span>Latest post</span>
                </div>
                <h4 className="font-serif text-sm font-semibold leading-snug text-foreground group-hover/post:text-primary transition-colors line-clamp-2">
                  {writer.latestPost.title}
                </h4>
                {writer.latestPost.excerpt && (
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                    {writer.latestPost.excerpt}
                  </p>
                )}
              </Link>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
};
