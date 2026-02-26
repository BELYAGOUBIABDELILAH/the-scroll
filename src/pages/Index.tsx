import { motion, AnimatePresence } from "framer-motion";
import { Scroll, Lock, Users, MessageSquare, Flame } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ScrollCard } from "@/components/ScrollCard";
import { AlliancesWidget } from "@/components/AlliancesWidget";
import { PledgeAllianceModal } from "@/components/PledgeAllianceModal";
import { ChroniclesFilter } from "@/components/ChroniclesFilter";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { trackPageView } from "@/lib/analytics";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

/* ── Mock trending data for the Great Hall ── */
const trendingScrolls = [
  { id: "t1", title: "The Art of Strategic Patience", tag: "Tactics", author: "Daemon", readers: "1.2k" },
  { id: "t2", title: "When Fire Met Ice: A Valyrian Accord", tag: "Lore", author: "Rhaenyra", readers: "980" },
  { id: "t3", title: "Decree VII: On Bannerman Loyalty", tag: "Decrees", author: "Viserys", readers: "2.4k" },
  { id: "t4", title: "The Citadel's Hidden Archives", tag: "Lore", author: "Maester Cole", readers: "760" },
  { id: "t5", title: "Forging Alliances in the New Age", tag: "Tactics", author: "Otto", readers: "1.8k" },
  { id: "t6", title: "The Silent Council Speaks", tag: "Chronicles", author: "Alicent", readers: "3.1k" },
];

const featurePanels = [
  {
    icon: Lock,
    title: "The Abonnement Gate",
    description: "Seal your most valuable scrolls behind a subscriber-only gate. Only true bannermen gain passage.",
  },
  {
    icon: Users,
    title: "Forged Alliances",
    description: "Endorse fellow scribes and cross-pollinate audiences. A decentralized network of trusted voices.",
  },
  {
    icon: MessageSquare,
    title: "The Council",
    description: "Every scroll has a council chamber. Readers deliberate, debate, and shape the discourse.",
  },
];

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
          toast.success("Already subscribed!");
        } else {
          throw error;
        }
      } else {
        toast.success("Welcome to the realm.");
      }
      setEmail("");
      setShowAllianceModal(true);
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ═══════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════ */}
      <section className="relative flex min-h-[85vh] flex-col items-center justify-center px-6 pt-20">
        {/* Subtle radial glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[200px]"
            style={{ backgroundColor: "hsla(0, 72%, 45%, 0.05)" }}
          />
        </div>

        <motion.div
          className="relative z-10 flex max-w-2xl flex-col items-center text-center"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
        >
          <motion.h1
            variants={fadeUp}
            custom={0}
            className="mb-6 font-serif text-5xl font-bold leading-[1.1] tracking-tight text-foreground md:text-7xl"
          >
            Rule Your Realm.
            <br />
            Own Your Audience.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            custom={1}
            className="mb-12 max-w-lg text-lg leading-relaxed text-muted-foreground"
          >
            The minimalist publishing network for elite writers and their loyal bannermen.
          </motion.p>

          <motion.form
            variants={fadeUp}
            custom={2}
            onSubmit={handleSubscribe}
            className="flex w-full max-w-md gap-0 overflow-hidden rounded-lg border border-border"
          >
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 rounded-none border-0 bg-card text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:ring-offset-0 h-12 px-4"
            />
            <button
              type="submit"
              disabled={subscribing}
              className="shrink-0 bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {subscribing ? "…" : "Claim Your Publication"}
            </button>
          </motion.form>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════
          THE GREAT HALL — Trending Grid
      ═══════════════════════════════════════════ */}
      <section id="chronicles" className="mx-auto max-w-5xl px-6 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <h2 className="mb-2 font-serif text-3xl font-bold text-foreground">The Great Hall</h2>
          <p className="text-sm text-muted-foreground">Trending scrolls across the realm.</p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trendingScrolls.map((item, i) => (
            <motion.div
              key={item.id}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="group rounded-lg border border-border bg-card p-5 transition-all duration-200 hover:border-foreground/20"
            >
              <div className="mb-4 flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-secondary text-xs text-muted-foreground">
                    {item.author[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-muted-foreground">{item.author}</span>
              </div>

              <h3 className="mb-3 font-serif text-lg font-bold leading-snug text-foreground group-hover:text-foreground/90 transition-colors">
                {item.title}
              </h3>

              <div className="flex items-center justify-between">
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                  style={{ backgroundColor: "#18181B", color: "#A1A1AA", border: "1px solid #27272A" }}
                >
                  {item.tag}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Flame className="h-3 w-3 text-primary" />
                  {item.readers} Readers
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CHRONICLES — Real Scrolls Feed
      ═══════════════════════════════════════════ */}
      {scrolls && scrolls.length > 0 && (
        <section className="mx-auto max-w-[700px] px-6 pb-24">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-6"
          >
            <h2 className="mb-1 font-serif text-2xl font-bold text-foreground">Chronicles</h2>
            <p className="text-sm text-muted-foreground">Latest published scrolls.</p>
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
              className="flex flex-col gap-px border-t border-border"
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
                      tag={(scroll as any).tag}
                      featured={false}
                    />
                  </motion.div>
                ))}
            </motion.div>
          </AnimatePresence>
        </section>
      )}

      {/* ═══════════════════════════════════════════
          FEATURES — The Mechanics
      ═══════════════════════════════════════════ */}
      <section id="features" className="mx-auto max-w-5xl px-6 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <h2 className="mb-2 font-serif text-3xl font-bold text-foreground">The Mechanics</h2>
          <p className="text-sm text-muted-foreground">How the realm operates.</p>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-3">
          {featurePanels.map((panel, i) => (
            <motion.div
              key={panel.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="rounded-lg border border-border bg-card p-8"
            >
              <panel.icon className="mb-5 h-6 w-6 text-primary" />
              <h3 className="mb-3 font-serif text-xl font-bold text-foreground">{panel.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{panel.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          ALLIANCES
      ═══════════════════════════════════════════ */}
      {scribe && (
        <section id="council" className="mx-auto max-w-[700px] px-6 pb-16">
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

      {/* ═══════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════ */}
      <footer className="border-t border-border py-12">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 px-6 md:flex-row">
          <div className="flex items-center gap-2.5">
            <Scroll className="h-4 w-4 text-primary" />
            <span className="font-serif text-sm font-semibold text-muted-foreground">The Scroll</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-muted-foreground transition-colors hover:text-foreground">Terms</a>
            <a href="#" className="text-xs text-muted-foreground transition-colors hover:text-foreground">Privacy</a>
            <a href="#" className="text-xs text-muted-foreground transition-colors hover:text-foreground">Twitter</a>
          </div>

          <p className="text-xs text-muted-foreground/50">© {new Date().getFullYear()} The Scroll</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
