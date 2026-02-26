import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { ArrowLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

const ScrollView = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const { data: scroll, isLoading } = useQuery({
    queryKey: ["scroll", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scrolls")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: authorProfile } = useQuery({
    queryKey: ["author-profile", scroll?.author_id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("user_id", scroll!.author_id)
        .single();
      return data;
    },
    enabled: !!scroll?.author_id,
  });

  // Check if user is subscribed to the author
  const { data: isSubscribed } = useQuery({
    queryKey: ["subscription-check", user?.id, scroll?.author_id],
    queryFn: async () => {
      const { data } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("subscriber_id", user!.id)
        .eq("scribe_id", scroll!.author_id)
        .limit(1);
      return (data?.length ?? 0) > 0;
    },
    enabled: !!user && !!scroll?.author_id,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading scroll…</p>
      </div>
    );
  }

  if (!scroll) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background gap-4">
        <p className="text-muted-foreground">Scroll not found.</p>
        <Button variant="ghost" asChild>
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Return
          </Link>
        </Button>
      </div>
    );
  }

  const isAuthor = user?.id === scroll.author_id;
  const canReadFull = !scroll.is_sealed || isAuthor || isSubscribed;

  // Extract first paragraph for gated preview
  const firstParagraph = scroll.content.split("\n\n")[0] || scroll.content.split("\n")[0] || "";

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-6 py-12">
        {/* Back link */}
        <Link
          to="/"
          className="mb-8 inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to scrolls
        </Link>

        {/* Article header */}
        <header className="mb-10">
          <h1 className="mb-4 font-serif text-4xl font-bold leading-tight text-foreground md:text-5xl">
            {scroll.title}
          </h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="text-foreground font-medium">
              {authorProfile?.display_name ?? "Unknown"}
            </span>
            {scroll.published_at && (
              <>
                <span>·</span>
                <span>{format(new Date(scroll.published_at), "MMMM d, yyyy")}</span>
              </>
            )}
            {scroll.is_sealed && (
              <>
                <span>·</span>
                <span className="text-primary text-xs font-medium">Sealed</span>
              </>
            )}
          </div>
        </header>

        {/* Article body */}
        {canReadFull ? (
          <article className="text-base leading-[1.8]">
            <MarkdownRenderer content={scroll.content} />
          </article>
        ) : (
          <div className="relative">
            <article className="text-base leading-[1.8]">
              <MarkdownRenderer content={firstParagraph} />
            </article>

            {/* Blurred fade-out */}
            <div className="relative mt-0 h-40 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
            </div>

            {/* Gate prompt */}
            <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-card p-8 text-center">
              <Lock className="h-8 w-8 text-primary" />
              <h3 className="font-serif text-xl font-bold text-foreground">
                This scroll is sealed
              </h3>
              <p className="max-w-sm text-sm text-muted-foreground">
                Subscribe to unseal this scroll and access all premium content.
              </p>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/80" asChild>
                <Link to="/auth">Subscribe to unseal</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScrollView;
