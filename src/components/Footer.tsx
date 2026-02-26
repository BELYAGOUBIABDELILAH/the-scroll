import { Link } from "react-router-dom";
import { Scroll, Instagram, Github, Mail, Heart, ArrowRight } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const Footer = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    const { error } = await supabase.from("email_subscribers").insert({ email: email.trim() });
    setLoading(false);
    if (error?.code === "23505") {
      toast({ title: "Already subscribed!" });
    } else if (error) {
      toast({ title: "Something went wrong", variant: "destructive" });
    } else {
      toast({ title: "Welcome aboard!" });
      setEmail("");
    }
  };

  return (
    <footer className="relative border-t border-border bg-card overflow-hidden">
      {/* Subtle glow */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-1/2 bottom-0 h-[400px] w-[600px] -translate-x-1/2 translate-y-1/2 rounded-full blur-[200px]"
          style={{ backgroundColor: "hsla(0, 72%, 45%, 0.04)" }}
        />
      </div>

      {/* Newsletter CTA band */}
      <div className="relative z-10 border-b border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-12 sm:flex-row sm:justify-between">
          <div>
            <h3 className="font-serif text-xl font-bold text-foreground mb-1">Stay in the loop</h3>
            <p className="text-sm text-muted-foreground">The best scrolls, delivered weekly. No spam, unsubscribe anytime.</p>
          </div>
          <form onSubmit={handleSubscribe} className="flex w-full max-w-sm gap-2 sm:w-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="flex shrink-0 items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "..." : (
                <>
                  Subscribe
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand — takes 2 cols on lg */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <Scroll className="h-5 w-5 text-primary" />
              <span className="font-serif text-lg font-bold text-foreground">The Scroll</span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground mb-6">
              A sovereign publishing platform where writers own their words, their audience, and their future. No algorithms. No gatekeepers.
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: Instagram, href: "https://instagram.com/belyabdelilah", label: "Instagram" },
                { icon: Github, href: "https://github.com/BELYAGOUBIABDELILAH", label: "GitHub" },
                { icon: Mail, href: "mailto:belyagoubiabdillah@gmail.com", label: "Email" },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="group flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-all hover:border-primary/40 hover:text-primary hover:bg-primary/5"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-foreground">Product</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Start Writing", href: "/auth" },
                { label: "Discover", href: "/#chronicles" },
                { label: "Features", href: "/#features" },
                { label: "Blog", href: "/blog" },
              ].map((l) => (
                <li key={l.label}>
                  <Link to={l.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-foreground">Resources</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Help Center", href: "/help" },
                { label: "Community", href: "/community" },
                { label: "Writer Guide", href: "/writer-guide" },
              ].map((l) => (
                <li key={l.label}>
                  <Link to={l.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-foreground">Legal</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
              ].map((l) => (
                <li key={l.label}>
                  <Link to={l.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative z-10 border-t border-border bg-background/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <p className="text-xs tracking-wide text-muted-foreground/70">
            © {new Date().getFullYear()} <span className="font-serif font-semibold text-foreground/80">The Scroll</span>. All rights reserved.
          </p>
          <div className="h-px w-12 bg-primary/20 sm:hidden" />
          <p className="flex items-center gap-1.5 text-xs tracking-wide text-muted-foreground/70">
            Crafted with <Heart className="h-3 w-3 animate-pulse text-primary" /> for independent writers
          </p>
        </div>
      </div>
    </footer>
  );
};
