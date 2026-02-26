import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Scroll } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ScrollCard } from "@/components/ScrollCard";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  const { toast } = useToast();

  // Fetch the first scribe's profile for the hero
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

  // Fetch published scrolls with author names
  const { data: scrolls } = useQuery({
    queryKey: ["published-scrolls"],
    queryFn: async () => {
      const { data } = await supabase
        .from("scrolls")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false });
      if (!data?.length) return [];

      // Get author profiles
      const authorIds = [...new Set(data.map((s) => s.author_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", authorIds);

      const profileMap = new Map(
        (profiles ?? []).map((p) => [p.user_id, p.display_name ?? "Unknown"])
      );

      return data.map((s) => ({
        ...s,
        author_name: profileMap.get(s.author_id) ?? "Unknown",
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
          toast({ title: "Already pledged!", description: "This email has already sworn fealty." });
        } else {
          throw error;
        }
      } else {
        toast({ title: "Fealty pledged!", description: "You'll receive new scrolls by raven." });
      }
      setEmail("");
    } catch (error: any) {
      toast({ title: "Failed to pledge", description: error.message, variant: "destructive" });
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative flex min-h-[70vh] flex-col items-center justify-center px-6 pt-16">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[120px] animate-ember-glow" />
        </div>

        <motion.div
          className="relative z-10 flex max-w-xl flex-col items-center text-center"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
        >
          <motion.div variants={fadeUp} custom={0}>
            <Avatar className="mb-4 h-20 w-20 border-2 border-primary/30">
              <AvatarImage src={scribe?.avatar_url ?? undefined} />
              <AvatarFallback className="bg-secondary text-foreground font-serif text-2xl">
                {scribe?.display_name?.[0]?.toUpperCase() ?? "S"}
              </AvatarFallback>
            </Avatar>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            custom={1}
            className="mb-2 font-serif text-4xl font-bold text-foreground md:text-5xl"
          >
            {scribe?.display_name ?? "The Scroll"}
          </motion.h1>

          <motion.p variants={fadeUp} custom={2} className="mb-8 max-w-md text-muted-foreground leading-relaxed">
            {scribe?.bio ??
              "An exclusive publishing chamber for writers who craft words worth sealing. Subscribe to receive new scrolls by raven."}
          </motion.p>

          <motion.form
            variants={fadeUp}
            custom={3}
            onSubmit={handleSubscribe}
            className="flex w-full max-w-sm gap-2"
          >
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-border bg-secondary text-foreground placeholder:text-muted-foreground"
            />
            <Button
              type="submit"
              disabled={subscribing}
              className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/80"
            >
              Pledge Fealty
            </Button>
          </motion.form>
        </motion.div>
      </section>

      {/* Scrolls Feed */}
      {scrolls && scrolls.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pb-24">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-12 text-center"
          >
            <h2 className="mb-3 font-serif text-3xl font-bold text-foreground">Recent Scrolls</h2>
            <p className="text-muted-foreground">From the quills of our scribes.</p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {scrolls.map((scroll, i) => (
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
                  featured={i === 0}
                />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {scrolls && scrolls.length === 0 && (
        <section className="mx-auto max-w-md px-6 pb-24 text-center">
          <Scroll className="mx-auto mb-4 h-10 w-10 text-muted-foreground/30" />
          <p className="text-muted-foreground">No scrolls have been published yet. Check back soon.</p>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
          <div className="flex items-center gap-2">
            <Scroll className="h-4 w-4 text-primary" />
            <span className="font-serif text-sm font-semibold text-foreground">The Scroll</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Seal your words. Send your ravens. © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
