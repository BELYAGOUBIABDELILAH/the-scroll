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
    <nav className="fixed top-0 z-50 w-full border-b border-border/30 backdrop-blur-xl" style={{ backgroundColor: "rgba(8, 8, 8, 0.7)" }}>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Left: Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <Scroll className="h-5 w-5 text-primary" />
          <span className="font-serif text-xl font-bold tracking-wide text-foreground">The Scroll</span>
        </Link>

        {/* Center: Nav links (landing only) */}
        {isHome && (
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.href)}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </button>
            ))}
          </div>
        )}

        {/* Right: Auth */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {role === "scribe" ? (
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
              ) : (
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
                  <Link to="/feed">My Feed</Link>
                </Button>
              )}
              <Link to="/settings" className="hidden text-sm text-foreground hover:text-primary transition-colors sm:inline">
                {displayName}
              </Link>
              {role && (
                <Badge
                  variant="outline"
                  className={
                    role === "scribe"
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-scroll-gold/40 bg-scroll-gold/10 text-scroll-gold"
                  }
                >
                  {role === "scribe" ? "Scribe" : "Bannerman"}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="text-muted-foreground hover:text-foreground"
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
                className="bg-primary text-primary-foreground hover:bg-primary/80 rounded-md px-4"
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
