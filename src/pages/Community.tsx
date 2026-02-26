import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Users, MessageSquare, Award, ArrowRight, Send, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

const communityFeatures = [
  {
    icon: Users,
    title: "Writer Alliances",
    description:
      "Forge alliances with fellow scribes. Endorse each other, grow together, and build a decentralized network of trusted voices across the realm.",
    cta: "Explore Alliances",
    href: "/#council",
  },
  {
    icon: MessageSquare,
    title: "The Council",
    description:
      "Every scroll opens a council chamber. Readers deliberate, debate, and shape discourse. Your audience isn't passive — they're engaged participants.",
    cta: "Read Scrolls",
    href: "/#chronicles",
  },
  {
    icon: Award,
    title: "Bannerman Pledges",
    description:
      "Subscribers aren't just numbers — they're bannermen who pledge loyalty to your voice. Build a community of readers who truly care about your words.",
    cta: "Start Writing",
    href: "/auth",
  },
];

const Community = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");

  // Fetch testimonials with profiles
  const { data: testimonials } = useQuery({
    queryKey: ["community-testimonials"],
    queryFn: async () => {
      const { data } = await supabase
        .from("community_testimonials")
        .select("*")
        .order("created_at", { ascending: false });
      if (!data?.length) return [];
      const userIds = [...new Set(data.map((t: any) => t.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);
      const profileMap = new Map(
        (profiles ?? []).map((p) => [p.user_id, p])
      );
      return data.map((t: any) => ({
        ...t,
        display_name: profileMap.get(t.user_id)?.display_name ?? "Anonymous",
        avatar_url: profileMap.get(t.user_id)?.avatar_url ?? null,
      }));
    },
  });

  const postMutation = useMutation({
    mutationFn: async (content: string) => {
      const { error } = await supabase
        .from("community_testimonials")
        .insert({ user_id: user!.id, content });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-testimonials"] });
      setNewComment("");
      toast.success("Comment posted!");
    },
    onError: () => toast.error("Failed to post comment"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("community_testimonials")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-testimonials"] });
      toast.success("Comment deleted");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    postMutation.mutate(newComment.trim());
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 pt-28 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
            Join the Realm
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            The Scroll isn't just a platform — it's a community of independent writers and dedicated readers building something different.
          </p>
        </motion.div>

        <div className="space-y-6">
          {communityFeatures.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col gap-6 rounded-xl border border-border bg-card p-8 sm:flex-row sm:items-center"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <feature.icon className="h-7 w-7 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-serif text-xl font-bold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </div>
              <Link
                to={feature.href}
                className="flex shrink-0 items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                {feature.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-16 grid grid-cols-3 gap-4 rounded-xl border border-border bg-card p-8"
        >
          {[
            { value: "500+", label: "Active Writers" },
            { value: "50K+", label: "Readers" },
            { value: "10K+", label: "Posts Published" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-serif text-3xl font-bold text-foreground">{s.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Community Comments Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-20"
        >
          <h2 className="font-serif text-3xl font-bold text-foreground mb-2">Community Voices</h2>
          <p className="text-sm text-muted-foreground mb-8">Share your experience, thoughts, or feedback with the community.</p>

          {/* Post form */}
          {user ? (
            <form onSubmit={handleSubmit} className="mb-8 flex gap-3">
              <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts with the community…"
                className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                maxLength={500}
              />
              <button
                type="submit"
                disabled={postMutation.isPending || !newComment.trim()}
                className="flex shrink-0 items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                Post
              </button>
            </form>
          ) : (
            <div className="mb-8 rounded-xl border border-border bg-card p-6 text-center">
              <p className="text-sm text-muted-foreground mb-3">Sign in to share your thoughts with the community.</p>
              <Link
                to="/auth"
                className="inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                Sign In
              </Link>
            </div>
          )}

          {/* Comments list */}
          <div className="space-y-4">
            {testimonials?.length === 0 && (
              <div className="rounded-xl border border-border bg-card p-10 text-center">
                <MessageSquare className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">Be the first to share your thoughts!</p>
              </div>
            )}
            {testimonials?.map((t: any) => (
              <div
                key={t.id}
                className="flex gap-4 rounded-xl border border-border bg-card p-5"
              >
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarImage src={t.avatar_url} />
                  <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                    {(t.display_name?.[0] ?? "?").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-foreground">{t.display_name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(t.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{t.content}</p>
                </div>
                {user?.id === t.user_id && (
                  <button
                    onClick={() => deleteMutation.mutate(t.id)}
                    className="shrink-0 self-start text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Community;
