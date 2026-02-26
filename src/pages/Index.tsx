import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Feather } from "lucide-react";
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
      <section className="relative flex min-h-[85vh] flex-col items-center justify-center px-6 pt-20">
        {/* Dragon fire ambient glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute left-1/2 top-1/4 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[250px] animate-ember-glow"
            style={{ backgroundColor: "hsla(0, 80%, 30%, 0.06)" }}
          />
          <div
            className="absolute right-0 bottom-0 h-[400px] w-[400px] rounded-full blur-[200px] animate-ember-glow"
            style={{ backgroundColor: "hsla(30, 80%, 30%, 0.04)", animationDelay: "2s" }}
          />
          {/* Subtle top vignette */}
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-background to-transparent" />
        </div>

        <motion.div
          className="relative z-10 flex max-w-3xl flex-col items-center text-center"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
        >
          {/* Crown badge */}
          <motion.div variants={fadeUp} custom={0} className="mb-8 flex items-center gap-2.5 rounded-full border border-border/60 bg-card/80 px-5 py-2 backdrop-blur-sm border-ember-glow">
            <Feather className="h-3.5 w-3.5 text-primary" />
            <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Fire & Blood — Write Your Legacy</span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            custom={1}
            className="mb-6 font-serif text-5xl font-bold leading-[1.05] tracking-wide text-foreground md:text-7xl lg:text-8xl"
          >
            <span className="text-gradient-fire">Rule</span> Your
            <br />
            <span className="text-gradient-steel">Realm</span> of Words
          </motion.h1>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="font-body mb-10 max-w-lg text-lg leading-relaxed text-muted-foreground md:text-xl"
          >
            Forge your chronicles upon the Iron Throne of publishing. No algorithms. No gatekeepers. Only fire and ink.
          </motion.p>

          <motion.div variants={fadeUp} custom={3} className="flex items-center gap-5">
            <Link
              to="/auth"
              className="group relative inline-flex h-13 items-center rounded-lg bg-gradient-fire px-9 text-sm font-semibold uppercase tracking-[0.15em] text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/20"
            >
              Claim Your Throne
            </Link>
            <button
              onClick={() => document.getElementById("chronicles")?.scrollIntoView({ behavior: "smooth" })}
              className="font-body text-base text-muted-foreground underline-offset-4 hover:text-foreground hover:underline transition-colors"
            >
              Read the scrolls
            </button>
          </motion.div>
        </motion.div>

        {/* Stats — styled like house banners */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="relative z-10 mt-20 flex items-center gap-10 md:gap-16"
        >
          {stats.map((stat, i) => (
            <div key={stat.label} className="text-center">
              <p className="font-serif text-3xl font-bold text-gradient-fire">{stat.value}</p>
              <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/60">{stat.label}</p>
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
          className="mb-10 flex items-end justify-between gap-4"
        >
          <div>
            <span className="mb-2 inline-block font-mono text-[11px] font-semibold tracking-widest text-primary/60 uppercase">The Feed</span>
            <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">Popular on The Scroll</h2>
            <p className="mt-1 text-sm text-muted-foreground/80">Discover writers and ideas that matter.</p>
          </div>
          <p className="hidden text-xs text-muted-foreground/50 sm:block">{filteredScrolls.length} posts</p>
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

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTag + sortBy + searchQuery}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {filteredScrolls.length === 0 ? (
              <div className="flex flex-col items-center rounded-2xl border border-dashed border-border/60 bg-card/50 p-16 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/5">
                  <BookOpen className="h-6 w-6 text-primary/40" />
                </div>
                <p className="font-serif text-lg font-semibold text-foreground/80">No posts found</p>
                <p className="mt-1 text-sm text-muted-foreground/60">Try a different search or topic filter.</p>
                {activeTag !== "All" && (
                  <button
                    onClick={() => setActiveTag("All")}
                    className="mt-4 text-xs font-medium text-primary hover:text-primary/80 underline underline-offset-4 transition-colors"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6 snap-x snap-mandatory">
                {filteredScrolls.map((scroll, i) => (
                  <motion.div
                    key={scroll.id}
                    custom={i}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                    className="w-[340px] shrink-0 snap-start"
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
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* ═══════════════════════════════════════════
          WHY THE SCROLL — Manifesto-style
      ═══════════════════════════════════════════ */}
      <section id="features" className="relative overflow-hidden border-y border-border/40 py-28">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-0 top-0 h-[400px] w-[400px] rounded-full blur-[200px] animate-ember-glow" style={{ backgroundColor: "hsla(0, 80%, 30%, 0.04)" }} />
          <div className="absolute left-0 bottom-0 h-[300px] w-[300px] rounded-full blur-[180px]" style={{ backgroundColor: "hsla(30, 70%, 30%, 0.04)" }} />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 max-w-lg"
          >
            <span className="mb-3 inline-block font-sans text-[11px] font-semibold tracking-[0.25em] text-primary/60 uppercase">The Dragon's Decree</span>
            <h2 className="font-serif text-4xl font-bold leading-tight text-foreground md:text-5xl">
              Writing deserves<br /><span className="text-gradient-fire">dragon fire.</span>
            </h2>
          </motion.div>

          <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-2">
            {[
              {
                number: "01",
                title: "No Algorithm Overlords",
                body: "Your words reach your readers — not a feed ranked by engagement bait. Chronological, honest, yours.",
              },
              {
                number: "02",
                title: "You Own Everything",
                body: "Your subscriber list, your content, your data. Export anytime. No lock-in, no hostage negotiations.",
              },
              {
                number: "03",
                title: "Built for Depth",
                body: "Long-form essays, serialized stories, research threads. Not another platform optimized for hot takes.",
              },
              {
                number: "04",
                title: "Community, Not Clout",
                body: "Council discussions under every scroll. Readers who think, not just like. Discourse over dopamine.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.number}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="group relative bg-card p-10 transition-colors hover:bg-accent/30"
              >
                <span className="mb-4 block font-mono text-xs font-bold tracking-widest text-primary/40">{item.number}</span>
                <h3 className="mb-3 font-serif text-xl font-bold text-foreground">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                <div className="absolute bottom-0 left-10 right-10 h-px bg-primary/0 transition-colors group-hover:bg-primary/20" />
              </motion.div>
            ))}
          </div>
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
      <section className="relative overflow-hidden border-t border-border/40 py-36">
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[250px] animate-ember-glow"
            style={{ backgroundColor: "hsla(0, 80%, 30%, 0.08)" }}
          />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 mx-auto flex max-w-2xl flex-col items-center text-center px-6"
        >
          <h2 className="mb-5 font-serif text-4xl font-bold leading-tight text-foreground md:text-6xl">
            <span className="text-gradient-fire">Fire & Blood.</span>
            <br />
            Your Words, Your Crown.
          </h2>
          <p className="font-body mb-10 max-w-md text-lg leading-relaxed text-muted-foreground">
            Join the scribes who chose sovereignty over algorithms. Forge your legacy — free, forever.
          </p>
          <Link
            to="/auth"
            className="inline-flex h-13 items-center rounded-lg bg-gradient-fire px-10 text-sm font-semibold uppercase tracking-[0.15em] text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/20"
          >
            Claim Your Throne
          </Link>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
