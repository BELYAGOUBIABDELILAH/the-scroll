import { Link } from "react-router-dom";
import { Scroll, Twitter, Github, Mail } from "lucide-react";
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
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Scroll className="h-5 w-5 text-primary" />
              <span className="font-serif text-lg font-bold text-foreground">The Scroll</span>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              A sovereign publishing platform where writers own their words, their audience, and their future.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a href="#" className="rounded-full border border-border p-2 text-muted-foreground transition-colors hover:text-foreground hover:border-foreground/30">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="rounded-full border border-border p-2 text-muted-foreground transition-colors hover:text-foreground hover:border-foreground/30">
                <Github className="h-4 w-4" />
              </a>
              <a href="#" className="rounded-full border border-border p-2 text-muted-foreground transition-colors hover:text-foreground hover:border-foreground/30">
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">Product</h4>
            <ul className="space-y-3">
              {[
                { label: "Start Writing", href: "/auth" },
                { label: "Discover", href: "/#chronicles" },
                { label: "Pricing", href: "#" },
                { label: "Features", href: "/#features" },
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
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">Resources</h4>
            <ul className="space-y-3">
              {[
                { label: "Help Center", href: "#" },
                { label: "Community", href: "#" },
                { label: "Blog", href: "#" },
                { label: "Privacy Policy", href: "#" },
                { label: "Terms of Service", href: "#" },
              ].map((l) => (
                <li key={l.label}>
                  <Link to={l.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">Stay Updated</h4>
            <p className="mb-4 text-sm text-muted-foreground">Get the best stories delivered to your inbox.</p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="shrink-0 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "..." : "Join"}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} The Scroll. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
