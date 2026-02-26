import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Scroll, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

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

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <Scroll className="h-5 w-5 text-primary" />
          <span className="font-serif text-xl font-bold tracking-wide text-foreground">The Scroll</span>
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden text-sm text-foreground sm:inline">{displayName}</span>
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
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
                <Link to="/auth">Read the Scrolls</Link>
              </Button>
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/80" asChild>
                <Link to="/auth">Enter the Keep</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
