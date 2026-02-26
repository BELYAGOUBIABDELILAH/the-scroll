import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock } from "lucide-react";

export const RecommendedSidebar = () => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["recommended-sidebar"],
    queryFn: async () => {
      const { data: scrolls } = await supabase
        .from("scrolls")
        .select("id, title, author_id, excerpt, published_at")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(5);

      if (!scrolls?.length) return [];

      const authorIds = [...new Set(scrolls.map((s) => s.author_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", authorIds);

      const profileMap = new Map((profiles ?? []).map((p) => [p.user_id, p.display_name ?? "Anonymous"]));

      return scrolls.map((s) => ({
        ...s,
        author_name: profileMap.get(s.author_id) ?? "Anonymous",
        readTime: s.excerpt ? Math.max(1, Math.ceil(s.excerpt.length / 200)) : 2,
      }));
    },
  });

  return (
    <aside className="sticky top-24">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Recommended
      </h3>
      <div className="space-y-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))
          : posts?.map((post) => (
              <Link
                key={post.id}
                to={`/scroll/${post.id}`}
                className="group block rounded-lg border border-transparent p-3 transition-colors hover:border-border hover:bg-card"
              >
                <h4 className="font-serif text-sm font-semibold leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h4>
                <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{post.author_name}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.readTime} min
                  </span>
                </div>
              </Link>
            ))}
      </div>
    </aside>
  );
};
