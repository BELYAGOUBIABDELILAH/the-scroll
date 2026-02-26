import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scroll, Shield, Feather, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

type AuthMode = "signin" | "signup" | "forgot";
type Role = "scribe" | "bannerman";

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<Role>("bannerman");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast({
          title: "Raven sent",
          description: "Check your email for a password reset link.",
        });
        setMode("signin");
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName || email.split("@")[0], role },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast({
          title: "Scroll sealed!",
          description: "Check your email to verify your account before signing in.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate("/");
      }
    } catch (error: any) {
      toast({
        title: "The gates remain shut",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <Scroll className="mx-auto mb-3 h-8 w-8 text-primary" />
          <h1 className="font-serif text-3xl font-bold text-foreground">
            {mode === "signin" ? "Enter the Keep" : mode === "signup" ? "Pledge Your Name" : "Forgot Password"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signin"
              ? "Sign in to access your scrolls."
              : mode === "signup"
              ? "Create your account and choose your path."
              : "Enter your email and we'll send a raven."}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-muted-foreground text-sm">
                  Display Name
                </Label>
                <Input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name in the realm"
                  className="border-border bg-secondary text-foreground placeholder:text-muted-foreground"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-muted-foreground text-sm">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="border-border bg-secondary text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {mode !== "forgot" && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-muted-foreground text-sm">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="border-border bg-secondary text-foreground placeholder:text-muted-foreground"
                />
              </div>
            )}

            {mode === "signin" && (
              <button
                type="button"
                onClick={() => setMode("forgot")}
                className="text-xs text-muted-foreground hover:text-primary"
              >
                Forgot your password?
              </button>
            )}

            {/* Role Selection — signup only */}
            {mode === "signup" && (
              <div className="space-y-3 pt-2">
                <Label className="text-muted-foreground text-sm">Choose Your Path</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("scribe")}
                    className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-all ${
                      role === "scribe"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-secondary text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    <Feather className="h-6 w-6" />
                    <span className="font-serif text-sm font-semibold">Scribe</span>
                    <span className="text-xs opacity-70">Write & publish</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("bannerman")}
                    className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-all ${
                      role === "bannerman"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-secondary text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    <BookOpen className="h-6 w-6" />
                    <span className="font-serif text-sm font-semibold">Bannerman</span>
                    <span className="text-xs opacity-70">Read & follow</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/80"
          >
            <Shield className="mr-2 h-4 w-4" />
            {loading
              ? "Sending…"
              : mode === "signin"
              ? "Enter the Keep"
              : mode === "signup"
              ? "Seal My Name"
              : "Send Recovery Raven"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "signin" ? (
            <>
              No account yet?{" "}
              <button onClick={() => setMode("signup")} className="text-primary hover:underline">
                Pledge your name
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button onClick={() => setMode("signin")} className="text-primary hover:underline">
                Enter the Keep
              </button>
            </>
          )}
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
