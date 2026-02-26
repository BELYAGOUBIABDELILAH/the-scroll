import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { ArrowLeft, Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { trackScrollView } from "@/lib/analytics";
import { toast } from "sonner";
import { CouncilComments } from "@/components/CouncilComments";
import { PledgeAllianceModal } from "@/components/PledgeAllianceModal";

function getReadingTime(content: string): string {
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

function getFirstTwoParagraphs(content: string): string {
  const paragraphs = content.split(/\n\n/);
  return paragraphs.slice(0, 2).join("\n\n");
}

const ScrollView = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showAllianceModal, setShowAllianceModal] = useState(false);

  useEffect(() => {
    if (id) trackScrollView(id);
  }, [id]);

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

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribing(true);
    try {
      const { error } = await supabase
        .from("email_subscribers")
        .insert({ email: email.trim() });
      if (error) {
        if (error.code === "23505") {
          toast.success("Vous êtes déjà abonné !");
        } else {
          throw error;
        }
      } else {
        toast.success("Abonnement confirmé !");
      }
      setSubscribed(true);
      setShowAllianceModal(true);
    } catch {
      toast.error("Une erreur est survenue. Réessayez.");
    } finally {
      setSubscribing(false);
    }
  };

  const handleShare = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Lien copié !");
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "#080808" }}>
        <p className="text-[#A1A1AA]">Chargement…</p>
      </div>
    );
  }

  if (!scroll) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4" style={{ backgroundColor: "#080808" }}>
        <p className="text-[#A1A1AA]">Scroll introuvable.</p>
        <Button variant="ghost" asChild>
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour
          </Link>
        </Button>
      </div>
    );
  }

  const isAuthor = user?.id === scroll.author_id;
  const canReadFull = !scroll.is_sealed || isAuthor || isSubscribed || subscribed;
  const preview = getFirstTwoParagraphs(scroll.content);
  const readingTime = getReadingTime(scroll.content);
  const authorInitial = authorProfile?.display_name?.[0]?.toUpperCase() || "?";

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#080808" }}>
      <div className="mx-auto max-w-[700px] px-6 py-16 md:py-24">
        {/* Header */}
        <header className="mb-12">
          <h1
            className="font-serif-display text-[2.5rem] md:text-[3.25rem] font-bold leading-[1.15] tracking-tight mb-6"
            style={{ color: "#EBEBEB" }}
          >
            {scroll.title}
          </h1>

          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              {authorProfile?.avatar_url ? (
                <AvatarImage src={authorProfile.avatar_url} alt={authorProfile.display_name || ""} />
              ) : null}
              <AvatarFallback className="text-xs" style={{ backgroundColor: "#1A1A1A", color: "#A1A1AA" }}>
                {authorInitial}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2 text-sm" style={{ color: "#A1A1AA", fontFamily: "'Inter', sans-serif" }}>
              <span className="font-medium" style={{ color: "#D4D4D8" }}>
                {authorProfile?.display_name ?? "Anonyme"}
              </span>
              {scroll.published_at && (
                <>
                  <span>·</span>
                  <span>{format(new Date(scroll.published_at), "d MMM yyyy")}</span>
                </>
              )}
              <span>·</span>
              <span>{readingTime}</span>
            </div>
          </div>
        </header>

        {/* Body */}
        {canReadFull ? (
          <article>
            <MarkdownRenderer content={scroll.content} />
          </article>
        ) : (
          <div className="relative">
            <article>
              <MarkdownRenderer content={preview} />
            </article>

            {/* Gradient fade */}
            <div
              className="h-48 -mt-48 relative z-10"
              style={{
                background: "linear-gradient(to bottom, transparent 0%, #080808 100%)",
              }}
            />

            {/* Subscription gate */}
            <div
              className="relative z-20 rounded-lg p-8 md:p-10 text-center"
              style={{
                backgroundColor: "#0D0D0D",
                border: "1px solid #1A1A1A",
              }}
            >
              <h3
                className="font-serif-display text-xl md:text-2xl font-bold mb-2"
                style={{ color: "#EBEBEB" }}
              >
                S'abonner pour lire la suite
              </h3>
              <p className="text-sm mb-6" style={{ color: "#71717A" }}>
                Accédez à l'intégralité de cet article et aux prochaines publications.
              </p>

              {subscribed ? (
                <div className="flex items-center justify-center gap-2" style={{ color: "#A1A1AA" }}>
                  <Check className="h-4 w-4" />
                  <span className="text-sm">Merci pour votre abonnement !</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
                  <Input
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 border-[#1A1A1A] bg-[#080808] text-[#E5E5E5] placeholder:text-[#52525B]"
                  />
                  <button
                    type="submit"
                    disabled={subscribing}
                    className="px-6 py-2 rounded-md text-sm font-medium transition-opacity disabled:opacity-50"
                    style={{
                      backgroundColor: "#8B0000",
                      color: "#F5F5F5",
                    }}
                  >
                    {subscribing ? "…" : "S'abonner"}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer
          className="mt-16 pt-8 flex items-center justify-between text-sm"
          style={{ borderTop: "1px solid #1A1A1A", color: "#71717A" }}
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity"
            style={{ color: "#A1A1AA" }}
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity"
            style={{ color: "#A1A1AA" }}
          >
            {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
            {copied ? "Copié" : "Partager"}
          </button>
        </footer>

        {/* The Council — Comment Section */}
        {canReadFull && (
          <CouncilComments scrollId={scroll.id} authorId={scroll.author_id} />
        )}

        {/* Pledge Alliance Modal */}
        <PledgeAllianceModal
          scribeId={scroll.author_id}
          open={showAllianceModal}
          onClose={() => setShowAllianceModal(false)}
        />
      </div>
    </div>
  );
};

export default ScrollView;
