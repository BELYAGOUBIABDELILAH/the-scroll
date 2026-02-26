import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Scroll, LogOut, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const navLinks = [
  { label: "Discover", href: "/#chronicles" },
  { label: "Features", href: "/#features" },
];

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    if (!user) {
      setDisplayName(null);
      setRole(null);
      return;
    }

    const fetchProfile = async () => {
      const [{ data: profile }, { data: roles }] = await Promise.all([
        supabase.from("profiles").select("display_name").eq("user_id", user.id).single(),
        supabase.from("user_roles").select("role").eq("user_id", user.id).limit(1),
      ]);
      setDisplayName(profile?.display_name ?? user.email?.split("@")[0] ?? "Unknown");
      setRole((roles?.[0] as any)?.role ?? null);
    };

    fetchProfile();
  }, [user]);

  const handleNavClick = (href: string) => {
    if (href.startsWith("/#")) {
      const id = href.slice(2);
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <nav className="fixed top-0 z-50 w-full px-4 pt-4">
      <div
        className="mx-auto flex h-14 max-w-5xl items-center justify-between rounded-2xl border border-border/40 px-5 shadow-lg shadow-black/10 backdrop-blur-2xl"
        style={{ backgroundColor: "hsla(0, 0%, 5%, 0.65)" }}
      >
        {/* Left: Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <Scroll className="h-5 w-5 text-primary" />
          <span className="font-serif text-lg font-bold tracking-wide text-foreground">The Scroll</span>
        </Link>

        {/* Center: Nav links (landing only) */}
        {isHome && (
          <div className="hidden md:flex items-center gap-1 rounded-xl bg-muted/30 px-1.5 py-1">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.href)}
                className="rounded-lg px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-all hover:bg-accent/50 hover:text-foreground"
              >
                {link.label}
              </button>
            ))}
          </div>
        )}

        {/* Right: Auth */}
        <div className="flex items-center gap-2.5">
          {user ? (
            <>
              {role === "scribe" ? (
                <Button variant="ghost" size="sm" className="rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50" asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
              ) : (
                <Button variant="ghost" size="sm" className="rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50" asChild>
                  <Link to="/feed">My Feed</Link>
                </Button>
              )}
              <Link to="/settings" className="hidden text-sm text-foreground hover:text-primary transition-colors sm:inline">
                {displayName}
              </Link>
              {role && (
                <Badge
                  variant="outline"
                  className={`rounded-lg ${
                    role === "scribe"
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-scroll-gold/40 bg-scroll-gold/10 text-scroll-gold"
                  }`}
                >
                  {role === "scribe" ? "Scribe" : "Bannerman"}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={signOut}
                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                Sign In
              </Link>
              <Button
                size="sm"
                className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/80 px-4"
                asChild
              >
                <Link to="/auth">Start a Scroll</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
