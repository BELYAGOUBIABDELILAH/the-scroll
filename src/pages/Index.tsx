import { motion, AnimatePresence } from "framer-motion";
import { Scroll } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ScrollCard } from "@/components/ScrollCard";
import { AvatarUpload } from "@/components/AvatarUpload";
import { AlliancesWidget } from "@/components/AlliancesWidget";
import { PledgeAllianceModal } from "@/components/PledgeAllianceModal";
import { ChroniclesFilter } from "@/components/ChroniclesFilter";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { trackPageView } from "@/lib/analytics";
import { toast } from "sonner";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const Index = () => {
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [showAllianceModal, setShowAllianceModal] = useState(false);
  const [activeTag, setActiveTag] = useState("All");

  useEffect(() => {
    trackPageView();
  }, []);

  const { data: scribe } = useQuery({
    queryKey: ["scribe-profile"],
    queryFn: async () => {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "scribe")
        .limit(1);
      if (!roles?.length) return null;
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", roles[0].user_id)
        .single();
      return profile;
    },
  });

  const { data: scrolls } = useQuery({
    queryKey: ["published-scrolls"],
    queryFn: async () => {
      const { data } = await supabase
        .from("scrolls")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false });
      if (!data?.length) return [];

      const authorIds = [...new Set(data.map((s) => s.author_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", authorIds);

      const profileMap = new Map(
        (profiles ?? []).map((p) => [p.user_id, p.display_name ?? "Anonyme"])
      );

      return data.map((s) => ({
        ...s,
        author_name: profileMap.get(s.author_id) ?? "Anonyme",
      }));
    },
  });

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribing(true);
    try {
      const { error } = await supabase
        .from("email_subscribers")
        .insert({ email: email.trim().toLowerCase() });
      if (error) {
        if (error.code === "23505") {
          toast.success("Vous êtes déjà abonné !");
        } else {
          throw error;
        }
      } else {
        toast.success("Abonnement confirmé. Bienvenue.");
      }
      setEmail("");
      setShowAllianceModal(true);
    } catch (error: any) {
      toast.error("Une erreur est survenue. Réessayez.");
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#080808" }}>
      <Navbar />

      {/* Hero */}
      <section className="relative flex min-h-[75vh] flex-col items-center justify-center px-6 pt-20">
        {/* Subtle glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[160px]"
            style={{ backgroundColor: "hsla(0, 72%, 45%, 0.06)" }}
          />
        </div>

        <motion.div
          className="relative z-10 flex max-w-lg flex-col items-center text-center"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
        >
          <motion.div variants={fadeUp} custom={0}>
            <AvatarUpload
              currentUrl={scribe?.avatar_url ?? null}
              displayName={scribe?.display_name ?? "S"}
              size="lg"
            />
          </motion.div>

          <motion.h1
            variants={fadeUp}
            custom={1}
            className="mb-3 font-serif-display text-4xl font-bold tracking-tight md:text-5xl"
            style={{ color: "#EBEBEB" }}
          >
            {scribe?.display_name ?? "The Scroll"}
          </motion.h1>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="mb-10 max-w-md text-base leading-[1.7]"
            style={{ color: "#71717A" }}
          >
            {scribe?.bio ??
              "Un espace d'écriture exclusive. Abonnez-vous pour recevoir chaque nouvelle publication."}
          </motion.p>

          <motion.form
            variants={fadeUp}
            custom={3}
            onSubmit={handleSubscribe}
            className="flex w-full max-w-sm gap-2"
          >
            <Input
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 border-[#1A1A1A] bg-[#0D0D0D] placeholder:text-[#52525B]"
              style={{ color: "#E5E5E5" }}
            />
            <button
              type="submit"
              disabled={subscribing}
              className="shrink-0 rounded-md px-5 py-2 text-sm font-medium transition-opacity disabled:opacity-50"
              style={{ backgroundColor: "#8B0000", color: "#F5F5F5" }}
            >
              {subscribing ? "…" : "S'abonner"}
            </button>
          </motion.form>
        </motion.div>
      </section>

      {/* Scrolls Feed */}
      {scrolls && scrolls.length > 0 && (
        <section className="mx-auto max-w-[700px] px-6 pb-24">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-6"
          >
            <h2
              className="mb-1 font-serif-display text-2xl font-bold"
              style={{ color: "#EBEBEB" }}
            >
              Chronicles
            </h2>
            <p className="text-sm" style={{ color: "#52525B" }}>
              Les derniers articles publiés.
            </p>
          </motion.div>

          <div className="mb-8">
            <ChroniclesFilter
              tags={(() => {
                const unique = [...new Set(scrolls.map((s) => (s as any).tag).filter((t: string) => t && t !== "general"))];
                return unique;
              })()}
              activeTag={activeTag}
              onTagChange={setActiveTag}
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTag}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="flex flex-col gap-px"
              style={{ borderTop: "1px solid #1A1A1A" }}
            >
              {scrolls
                .filter((s) => activeTag === "All" || (s as any).tag === activeTag)
                .map((scroll, i) => (
                  <motion.div
                    key={scroll.id}
                    custom={i}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                  >
                    <ScrollCard
                      id={scroll.id}
                      title={scroll.title}
                      excerpt={scroll.excerpt}
                      is_sealed={scroll.is_sealed}
                      published_at={scroll.published_at}
                      author_name={scroll.author_name}
                      featured={false}
                    />
                  </motion.div>
                ))}
            </motion.div>
          </AnimatePresence>
        </section>
      )}

      {/* Empty state */}
      {scrolls && scrolls.length === 0 && (
        <section className="mx-auto max-w-md px-6 pb-24 text-center">
          <Scroll className="mx-auto mb-4 h-10 w-10" style={{ color: "#27272A" }} />
          <p style={{ color: "#52525B" }}>Aucune publication pour le moment.</p>
        </section>
      )}

      {/* Alliances Widget */}
      {scribe && (
        <section className="mx-auto max-w-[700px] px-6 pb-16">
          <AlliancesWidget scribeId={scribe.user_id} />
        </section>
      )}

      {/* Pledge Alliance Modal */}
      {scribe && (
        <PledgeAllianceModal
          scribeId={scribe.user_id}
          open={showAllianceModal}
          onClose={() => setShowAllianceModal(false)}
        />
      )}

      {/* Footer */}
      <footer className="py-12" style={{ borderTop: "1px solid #1A1A1A" }}>
        <div className="mx-auto flex max-w-[700px] flex-col items-center justify-between gap-4 px-6 md:flex-row">
          <div className="flex items-center gap-2">
            <Scroll className="h-4 w-4" style={{ color: "#8B0000" }} />
            <span className="font-serif-display text-sm font-semibold" style={{ color: "#A1A1AA" }}>
              The Scroll
            </span>
          </div>
          <p className="text-xs" style={{ color: "#3F3F46" }}>
            © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
