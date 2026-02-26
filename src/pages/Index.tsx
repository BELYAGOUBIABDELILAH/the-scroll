import { motion, AnimatePresence } from "framer-motion";
import { Lock, Users, MessageSquare, BookOpen, Feather } from "lucide-react";
import { FeaturedWriters } from "@/components/FeaturedWriters";
import { HowItWorks } from "@/components/HowItWorks";
import { Testimonials } from "@/components/Testimonials";
import { Footer } from "@/components/Footer";
import { TopicBar } from "@/components/TopicBar";
import { FeedCard } from "@/components/FeedCard";
import { RecommendedSidebar } from "@/components/RecommendedSidebar";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { AlliancesWidget } from "@/components/AlliancesWidget";
import { PledgeAllianceModal } from "@/components/PledgeAllianceModal";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
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

const stats = [
  { label: "Writers", value: "500+" },
  { label: "Posts Published", value: "10K+" },
  { label: "Readers", value: "50K+" },
];

const Index = () => {
  const [showAllianceModal, setShowAllianceModal] = useState(false);
  const [activeTag, setActiveTag] = useState("All");
  const [sortBy, setSortBy] = useState("latest");
  const [searchQuery, setSearchQuery] = useState("");

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
        .select("user_id, display_name, avatar_url")
        .in("user_id", authorIds);

      const profileMap = new Map(
        (profiles ?? []).map((p) => [p.user_id, { name: p.display_name ?? "Anonymous", avatar: p.avatar_url }])
      );

      // Get comment counts
      const scrollIds = data.map((s) => s.id);
      const { data: comments } = await supabase
        .from("comments")
        .select("scroll_id")
        .in("scroll_id", scrollIds);
      const commentMap: Record<string, number> = {};
      (comments ?? []).forEach((c) => {
        commentMap[c.scroll_id] = (commentMap[c.scroll_id] ?? 0) + 1;
      });

      return data.map((s) => ({
        ...s,
        author_name: profileMap.get(s.author_id)?.name ?? "Anonymous",
        author_avatar: profileMap.get(s.author_id)?.avatar ?? null,
        comment_count: commentMap[s.id] ?? 0,
      }));
    },
  });

  const tags = useMemo(() => {
    if (!scrolls) return [];
    return [...new Set(scrolls.map((s) => s.tag).filter((t) => t && t !== "general"))];
  }, [scrolls]);

  const filteredScrolls = useMemo(() => {
    if (!scrolls) return [];
    let filtered = scrolls;

    // Tag filter
    if (activeTag !== "All") {
      filtered = filtered.filter((s) => s.tag === activeTag);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.excerpt?.toLowerCase().includes(q) ||
          s.author_name.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortBy === "popular") {
      filtered = [...filtered].sort((a, b) => (b.comment_count ?? 0) - (a.comment_count ?? 0));
    }
    // "trending" and "latest" both use default published_at desc

    return filtered;
  }, [scrolls, activeTag, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ═══════════════════════════════════════════
          HERO — Clean Substack-style
      ═══════════════════════════════════════════ */}
      <section className="relative flex min-h-[70vh] flex-col items-center justify-center px-6 pt-20">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[200px]"
            style={{ backgroundColor: "hsla(0, 72%, 45%, 0.04)" }}
          />
        </div>

        <motion.div
          className="relative z-10 flex max-w-2xl flex-col items-center text-center"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
        >
          <motion.div variants={fadeUp} custom={0} className="mb-6 flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5">
            <Feather className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">The sovereign publishing platform</span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            custom={1}
            className="mb-6 font-serif text-5xl font-bold leading-[1.08] tracking-tight text-foreground md:text-7xl"
          >
            A place for
            <br />
            independent writing
          </motion.h1>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="mb-10 max-w-md text-lg leading-relaxed text-muted-foreground"
          >
            Start a publication. Build your audience. Own your creative future — no algorithms, no gatekeepers.
          </motion.p>

          <motion.div variants={fadeUp} custom={3} className="flex items-center gap-4">
            <Link
              to="/auth"
              className="inline-flex h-12 items-center rounded-lg bg-primary px-8 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Get Started
            </Link>
            <button
              onClick={() => document.getElementById("chronicles")?.scrollIntoView({ behavior: "smooth" })}
              className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline transition-colors"
            >
              Explore posts
            </button>
          </motion.div>
        </motion.div>

        {/* Social proof bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="relative z-10 mt-16 flex items-center gap-8 md:gap-12"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-serif text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════
          FEATURED WRITERS CAROUSEL
      ═══════════════════════════════════════════ */}
      <FeaturedWriters />

      {/* ═══════════════════════════════════════════
          FEED — 2-column Substack layout
      ═══════════════════════════════════════════ */}
      <section id="chronicles" className="mx-auto max-w-6xl px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h2 className="mb-1 font-serif text-3xl font-bold text-foreground">Popular on The Scroll</h2>
          <p className="text-sm text-muted-foreground">Discover writers and ideas that matter.</p>
        </motion.div>

        {/* Topic bar with search and sort */}
        <div className="mb-8">
          <TopicBar
            tags={tags}
            activeTag={activeTag}
            onTagChange={setActiveTag}
            sortBy={sortBy}
            onSortChange={setSortBy}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        {/* 2-column layout */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main feed */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTag + sortBy + searchQuery}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {filteredScrolls.length === 0 ? (
                  <div className="rounded-xl border border-border bg-card p-12 text-center">
                    <BookOpen className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">No posts found.</p>
                  </div>
                ) : (
                  filteredScrolls.map((scroll, i) => (
                    <motion.div
                      key={scroll.id}
                      custom={i}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      variants={fadeUp}
                    >
                      <FeedCard
                        id={scroll.id}
                        title={scroll.title}
                        excerpt={scroll.excerpt}
                        is_sealed={scroll.is_sealed}
                        published_at={scroll.published_at}
                        author_name={scroll.author_name}
                        author_id={scroll.author_id}
                        author_avatar={scroll.author_avatar}
                        tag={scroll.tag}
                        comment_count={scroll.comment_count}
                      />
                    </motion.div>
                  ))
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block">
            <RecommendedSidebar />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FEATURES
      ═══════════════════════════════════════════ */}
      <section id="features" className="mx-auto max-w-5xl px-6 pb-24">
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

      <HowItWorks />
      <Testimonials />

      {/* Alliances */}
      {scribe && (
        <section id="council" className="mx-auto max-w-[700px] px-6 pb-16">
          <AlliancesWidget scribeId={scribe.user_id} />
        </section>
      )}

      {scribe && (
        <PledgeAllianceModal
          scribeId={scribe.user_id}
          open={showAllianceModal}
          onClose={() => setShowAllianceModal(false)}
        />
      )}

      {/* ═══════════════════════════════════════════
          FINAL CTA
      ═══════════════════════════════════════════ */}
      <section className="relative overflow-hidden border-t border-border py-32">
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[200px]"
            style={{ backgroundColor: "hsla(0, 72%, 45%, 0.06)" }}
          />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 mx-auto flex max-w-2xl flex-col items-center text-center px-6"
        >
          <h2 className="mb-4 font-serif text-4xl font-bold leading-tight text-foreground md:text-5xl">
            Your Realm Awaits.
          </h2>
          <p className="mb-10 max-w-md text-base leading-relaxed text-muted-foreground">
            Join the scribes who chose sovereignty over algorithms. Start publishing on your own terms — free, forever.
          </p>
          <Link
            to="/auth"
            className="inline-flex h-12 items-center rounded-lg bg-primary px-8 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Start Your Scroll — It's Free
          </Link>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
