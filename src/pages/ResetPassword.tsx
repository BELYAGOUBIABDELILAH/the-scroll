import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scroll, KeyRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      }
    });

    // Also check hash for type=recovery
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setIsRecovery(true);
    }

    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast({
        title: "Password updated",
        description: "Your password has been changed. You may now sign in.",
      });
      navigate("/auth");
    } catch (error: any) {
      toast({
        title: "Failed to update password",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <Scroll className="mx-auto mb-3 h-8 w-8 text-primary" />
          <h1 className="font-serif text-3xl font-bold text-foreground">Reforge Your Key</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isRecovery
              ? "Enter your new password below."
              : "Follow the link in your email to reset your password."}
          </p>
        </div>

        {isRecovery ? (
          <form onSubmit={handleReset} className="space-y-5">
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-muted-foreground text-sm">New Password</Label>
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
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/80"
            >
              <KeyRound className="mr-2 h-4 w-4" />
              {loading ? "Reforging…" : "Set New Password"}
            </Button>
          </form>
        ) : (
          <div className="rounded-lg border border-border bg-card p-6 text-center">
            <p className="text-sm text-muted-foreground">
              If you requested a password reset, check your email for a recovery link.
            </p>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/auth" className="text-primary hover:underline">Back to the Keep</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
