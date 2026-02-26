import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, ArrowLeft, Share2, Check } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ChroniclesFilter } from "@/components/ChroniclesFilter";
import { AlliancesWidget } from "@/components/AlliancesWidget";
import { PledgeAllianceModal } from "@/components/PledgeAllianceModal";
import { Link } from "react-router-dom";

function getReadingTime(content: string): string {
  const words = content.trim().split(/\s+/).length;
  return `${Math.max(1, Math.ceil(words / 200))} min`;
}

const ShareButton = () => {
  const [copied, setCopied] = useState(false);
  const handleShare = useCallback(async () => {
    await navigator.clipboard.writeText(window.location.href);
    toast.success("Lien copié !");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);
  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-2 text-sm transition-opacity hover:opacity-70"
      style={{ color: "#A1A1AA" }}
    >
      {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
      {copied ? "Copié" : "Partager"}
    </button>
  );
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const WriterProfile = () => {
  const { id: scribeId } = useParams<{ id: string }>();
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [showAllianceModal, setShowAllianceModal] = useState(false);
  const [activeTag, setActiveTag] = useState("All");

  /* ── Profile ── */
  const { data: profile, isLoading } = useQuery({
    queryKey: ["writer-profile", scribeId],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", scribeId!)
        .single();
      return data;
    },
    enabled: !!scribeId,
  });

  /* ── Subscriber count ── */
  const { data: subCount = 0 } = useQuery({
    queryKey: ["sub-count", scribeId],
    queryFn: async () => {
      const { count } = await supabase
        .from("subscriptions")
        .select("id", { count: "exact", head: true })
        .eq("scribe_id", scribeId!);
      return count ?? 0;
    },
    enabled: !!scribeId,
  });

  /* ── Published scrolls ── */
  const { data: scrolls = [] } = useQuery({
    queryKey: ["writer-scrolls", scribeId],
    queryFn: async () => {
      const { data } = await supabase
        .from("scrolls")
        .select("*")
        .eq("author_id", scribeId!)
        .eq("status", "published")
        .order("published_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!scribeId,
  });

  /* ── Comment counts ── */
  const scrollIds = scrolls.map((s) => s.id);
  const { data: commentCounts = {} } = useQuery({
    queryKey: ["comment-counts", scrollIds],
    queryFn: async () => {
      if (!scrollIds.length) return {};
      const { data } = await supabase
        .from("comments")
        .select("scroll_id")
        .in("scroll_id", scrollIds);
      const map: Record<string, number> = {};
      (data ?? []).forEach((c) => {
        map[c.scroll_id] = (map[c.scroll_id] ?? 0) + 1;
      });
      return map;
    },
    enabled: scrollIds.length > 0,
  });

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribing(true);
    try {
      const { error } = await supabase
        .from("email_subscribers")
        .insert({ email: email.trim().toLowerCase() });
      if (error) {
        if (error.code === "23505") toast.success("Déjà abonné !");
        else throw error;
      } else {
        toast.success("Abonnement confirmé !");
      }
      setEmail("");
      setShowAllianceModal(true);
    } catch {
      toast.error("Une erreur est survenue.");
    } finally {
      setSubscribing(false);
    }
  };

  const tags = [...new Set(scrolls.map((s) => s.tag).filter((t) => t && t !== "general"))];
  const filtered = scrolls.filter((s) => activeTag === "All" || s.tag === activeTag);
  const displayName = profile?.display_name ?? "Anonyme";
  const initial = displayName[0]?.toUpperCase() ?? "?";

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "#080808" }}>
        <p style={{ color: "#A1A1AA" }}>Chargement…</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "#080808" }}>
        <p style={{ color: "#A1A1AA" }}>Scribe introuvable.</p>
      </div>
    );
  }

  /* ── Subscribe form (reusable) ── */
  const SubscribeForm = ({ compact = false }: { compact?: boolean }) => (
    <form
      onSubmit={handleSubscribe}
      className={`flex w-full overflow-hidden rounded-lg border border-border ${compact ? "max-w-full" : "max-w-md"}`}
    >
      <Input
        type="email"
        placeholder="votre@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="flex-1 rounded-none border-0 bg-card text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:ring-offset-0 h-11 px-4"
      />
      <button
        type="submit"
        disabled={subscribing}
        className="shrink-0 px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: "#8B0000" }}
      >
        {subscribing ? "…" : "S'abonner"}
      </button>
    </form>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#080808" }}>
      {/* ── Top nav bar ── */}
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 pt-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm transition-opacity hover:opacity-70"
          style={{ color: "#A1A1AA" }}
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Link>
        <ShareButton />
      </div>

      {/* ═══════════════════════════════════════════
          COMPONENT 1: THE ROYAL BANNER
      ═══════════════════════════════════════════ */}
      <section
        className="relative flex flex-col items-center px-6 pb-16 pt-12 md:pt-16 text-center"
        style={{
          background: "linear-gradient(180deg, #0A0A0A 0%, #080808 100%)",
        }}
      >
        {/* Faint grain overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />

        <motion.div
          className="relative z-10"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
        >
          <motion.div variants={fadeUp} custom={0} className="mb-6">
            <Avatar className="mx-auto h-28 w-28 md:h-36 md:w-36" style={{ filter: "grayscale(100%)" }}>
              {profile.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt={displayName} />
              ) : null}
              <AvatarFallback
                className="text-3xl font-serif font-bold"
                style={{ backgroundColor: "#1A1A1A", color: "#A1A1AA" }}
              >
                {initial}
              </AvatarFallback>
            </Avatar>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            custom={1}
            className="mb-4 font-serif text-4xl font-bold leading-tight tracking-tight md:text-6xl"
            style={{ color: "#FFFFFF" }}
          >
            {displayName}
          </motion.h1>

          {profile.bio && (
            <motion.p
              variants={fadeUp}
              custom={2}
              className="mx-auto mb-8 max-w-lg text-base leading-relaxed md:text-lg"
              style={{ color: "#A1A1AA", fontFamily: "'Inter', sans-serif", lineHeight: 1.7 }}
            >
              {profile.bio}
            </motion.p>
          )}

          <motion.div variants={fadeUp} custom={3} className="mx-auto max-w-md">
            <SubscribeForm />
            <p className="mt-3 text-xs" style={{ color: "#52525B" }}>
              Rejoignez {subCount.toLocaleString()} Bannermen assermentés.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════
          TWO-COLUMN LAYOUT
      ═══════════════════════════════════════════ */}
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col lg:flex-row">
          {/* ── Mobile sidebar (above feed on small screens) ── */}
          <div className="block lg:hidden mb-10">
            <SidebarContent
              profile={profile}
              displayName={displayName}
              scribeId={scribeId!}
              SubscribeForm={SubscribeForm}
            />
          </div>

          {/* ── LEFT COLUMN: Chronicles + Archives ── */}
          <main className="flex-1 lg:pr-10">
            {/* COMPONENT 2: THE CHRONICLES (Filter) */}
            {tags.length > 0 && (
              <div className="sticky top-0 z-20 pb-4 pt-2" style={{ backgroundColor: "#080808" }}>
                <ChroniclesFilter tags={tags} activeTag={activeTag} onTagChange={setActiveTag} />
              </div>
            )}

            {/* COMPONENT 3: THE ARCHIVES (Feed) */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTag}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="flex flex-col gap-4 pb-24"
              >
                {filtered.length === 0 && (
                  <p className="py-16 text-center text-sm" style={{ color: "#52525B" }}>
                    Aucun scroll dans cette chronique.
                  </p>
                )}
                {filtered.map((scroll, i) => (
                  <motion.div key={scroll.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                    <Link
                      to={`/scroll/${scroll.id}`}
                      className="group block rounded-lg border p-6 transition-all duration-200 hover:shadow-[0_0_20px_rgba(139,0,0,0.08)]"
                      style={{
                        backgroundColor: "#121212",
                        borderColor: "#27272A",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#3F3F46")}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#27272A")}
                    >
                      {/* Top row */}
                      <div className="mb-3 flex items-center gap-2 text-xs" style={{ color: "#52525B" }}>
                        {scroll.published_at && (
                          <span>{format(new Date(scroll.published_at), "d MMM yyyy")}</span>
                        )}
                        <span>·</span>
                        <span>{getReadingTime(scroll.content)}</span>
                      </div>

                      {/* Title */}
                      <h3
                        className="mb-2 font-serif text-xl font-bold leading-snug group-hover:opacity-90 transition-opacity"
                        style={{ color: "#FFFFFF" }}
                      >
                        {scroll.title}
                      </h3>

                      {/* Excerpt */}
                      {scroll.excerpt && (
                        <p
                          className="mb-4 text-sm line-clamp-2 leading-relaxed"
                          style={{ color: "#71717A", fontFamily: "'Inter', sans-serif" }}
                        >
                          {scroll.excerpt}
                        </p>
                      )}

                      {/* Bottom row */}
                      <div className="flex items-center justify-between">
                        {scroll.tag && scroll.tag !== "general" && (
                          <span
                            className="rounded-full px-2.5 py-0.5 text-xs font-medium capitalize"
                            style={{ backgroundColor: "#18181B", color: "#A1A1AA", border: "1px solid #27272A" }}
                          >
                            {scroll.tag}
                          </span>
                        )}
                        {(commentCounts[scroll.id] ?? 0) > 0 && (
                          <span className="flex items-center gap-1 text-xs" style={{ color: "#52525B" }}>
                            <MessageSquare className="h-3.5 w-3.5" />
                            {commentCounts[scroll.id]}
                          </span>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </main>

          {/* ── RIGHT COLUMN: The Keep (desktop only) ── */}
          <aside
            className="hidden lg:block w-[320px] shrink-0 border-l border-border"
          >
            <div className="sticky top-0 pl-10 pt-2 pb-24">
              <SidebarContent
                profile={profile}
                displayName={displayName}
                scribeId={scribeId!}
                SubscribeForm={SubscribeForm}
              />
            </div>
          </aside>
        </div>
      </div>

      {/* Pledge Alliance Modal */}
      {scribeId && (
        <PledgeAllianceModal
          scribeId={scribeId}
          open={showAllianceModal}
          onClose={() => setShowAllianceModal(false)}
        />
      )}
    </div>
  );
};

/* ── Sidebar content (shared mobile + desktop) ── */
interface SidebarContentProps {
  profile: { bio: string | null; display_name: string | null };
  displayName: string;
  scribeId: string;
  SubscribeForm: React.FC<{ compact?: boolean }>;
}

const SidebarContent = ({ profile, scribeId, SubscribeForm }: SidebarContentProps) => (
  <div className="flex flex-col gap-8">
    {/* Section A: The Author's Vow */}
    {profile.bio && (
      <div>
        <h3 className="mb-3 font-serif text-lg font-semibold" style={{ color: "#A1A1AA" }}>
          The Author's Vow
        </h3>
        <p
          className="text-sm leading-[1.7]"
          style={{ color: "#71717A", fontFamily: "'Inter', sans-serif" }}
        >
          {profile.bio}
        </p>
      </div>
    )}

    {/* Section B: Alliances */}
    <AlliancesWidget scribeId={scribeId} />

    {/* Section C: Secondary Abonnement */}
    <div
      className="rounded-lg p-5"
      style={{ backgroundColor: "#0D0D0D", border: "1px solid #1A1A1A" }}
    >
      <p className="mb-3 text-sm font-medium" style={{ color: "#A1A1AA" }}>
        Ne manquez aucun scroll.
      </p>
      <SubscribeForm compact />
    </div>
  </div>
);

export default WriterProfile;
