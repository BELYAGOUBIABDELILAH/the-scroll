import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { AvatarUpload } from "@/components/AvatarUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name, bio, avatar_url")
        .eq("user_id", user.id)
        .single();
      if (data) {
        setDisplayName(data.display_name ?? "");
        setBio(data.bio ?? "");
        setAvatarUrl(data.avatar_url);
      }
      setLoaded(true);
    };
    load();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: displayName.trim() || null,
          bio: bio.trim() || null,
        })
        .eq("user_id", user.id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["scribe-profile"] });
      toast({ title: "Profile updated" });
    } catch (err: any) {
      toast({ title: "Failed to save", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-lg px-6 pt-24 pb-16">
        <h1 className="mb-8 font-serif text-3xl font-bold text-foreground">Profile Settings</h1>

        <div className="mb-8 flex justify-center">
          <AvatarUpload currentUrl={avatarUrl} displayName={displayName} size="lg" />
        </div>
        <p className="mb-8 text-center text-xs text-muted-foreground">Hover and click to change avatar</p>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-sm text-muted-foreground">
                Display Name
              </Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name in the realm"
                maxLength={100}
                className="border-border bg-secondary text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-sm text-muted-foreground">
                Bio
              </Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="A sentence or two about yourself…"
                maxLength={300}
                rows={3}
                className="border-border bg-secondary text-foreground placeholder:text-muted-foreground resize-none"
              />
              <p className="text-xs text-muted-foreground text-right">{bio.length}/300</p>
            </div>
          </div>

          <Button
            type="submit"
            disabled={saving}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/80"
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving…" : "Save Profile"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
