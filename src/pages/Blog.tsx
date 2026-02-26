import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FeedCard } from "@/components/FeedCard";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const Blog = () => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("scrolls")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(20);
      if (!data?.length) return [];

      const authorIds = [...new Set(data.map((s) => s.author_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", authorIds);
      const profileMap = new Map(
        (profiles ?? []).map((p) => [p.user_id, { name: p.display_name ?? "Anonymous", avatar: p.avatar_url }])
      );

      return data.map((s) => ({
        ...s,
        author_name: profileMap.get(s.author_id)?.name ?? "Anonymous",
        author_avatar: profileMap.get(s.author_id)?.avatar ?? null,
      }));
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 pt-28 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
            The Blog
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Updates, guides, and stories from The Scroll team and community.
          </p>
        </motion.div>

        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-xl" />
            ))
          ) : posts && posts.length > 0 ? (
            posts.map((post) => (
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
              <p className="text-muted-foreground">No blog posts yet. Stay tuned!</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
