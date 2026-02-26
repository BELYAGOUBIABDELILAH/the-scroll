import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Send, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ScrollEditor = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tag, setTag] = useState("general");
  const [isSealed, setIsSealed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [loaded, setLoaded] = useState(!id); // true immediately if new scroll

  // Load existing scroll for editing
  useEffect(() => {
    if (!id || !user) return;
    const load = async () => {
      const { data, error } = await supabase
        .from("scrolls")
        .select("*")
        .eq("id", id)
        .eq("author_id", user.id)
        .single();
      if (error || !data) {
        toast({ title: "Scroll not found", variant: "destructive" });
        navigate("/dashboard");
        return;
      }
      setTitle(data.title);
      setContent(data.content);
      setTag((data as any).tag ?? "general");
      setIsSealed(data.is_sealed);
      setLoaded(true);
    };
    load();
  }, [id, user]);

  const generateExcerpt = (text: string) => {
    // Strip markdown and take first 200 chars
    const plain = text
      .replace(/^#+\s/gm, "")
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/\*(.+?)\*/g, "$1")
      .replace(/^>\s/gm, "")
      .replace(/^[\-\*]\s/gm, "");
    return plain.slice(0, 200).trim() || null;
  };

  const saveDraft = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const excerpt = generateExcerpt(content);
      if (id) {
        const { error } = await supabase
          .from("scrolls")
          .update({ title, content, excerpt, is_sealed: isSealed, tag } as any)
          .eq("id", id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("scrolls")
          .insert({ title, content, excerpt, is_sealed: isSealed, tag, author_id: user.id } as any)
          .select("id")
          .single();
        if (error) throw error;
        // Navigate to edit URL so subsequent saves update
        navigate(`/dashboard/edit/${data.id}`, { replace: true });
      }
      toast({ title: "Draft saved" });
    } catch (error: any) {
      toast({ title: "Failed to save", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const dispatch = async () => {
    if (!user || !title.trim()) {
      toast({ title: "A scroll needs a title", variant: "destructive" });
      return;
    }
    setDispatching(true);
    try {
      const excerpt = generateExcerpt(content);
      if (id) {
        const { error } = await supabase
          .from("scrolls")
          .update({
            title,
            content,
            excerpt,
            is_sealed: isSealed,
            tag,
            status: "published",
            published_at: new Date().toISOString(),
          } as any)
          .eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("scrolls").insert({
          title,
          content,
          excerpt,
          is_sealed: isSealed,
          tag,
          author_id: user.id,
          status: "published",
          published_at: new Date().toISOString(),
        } as any);
        if (error) throw error;
      }
      toast({ title: "Scroll dispatched!", description: "Your raven has taken flight." });
      navigate("/dashboard");
    } catch (error: any) {
      toast({ title: "Dispatch failed", description: error.message, variant: "destructive" });
    } finally {
      setDispatching(false);
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
      <div className="mx-auto max-w-3xl px-6 pt-24 pb-16">
        {/* Title */}
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title of your scroll…"
          className="mb-6 border-none bg-transparent font-serif text-3xl font-bold text-foreground placeholder:text-muted-foreground/40 focus-visible:ring-0 p-0 h-auto"
        />

        {/* Tag */}
        <div className="mb-6 flex items-center gap-2">
          <Label className="text-sm text-muted-foreground shrink-0">Tag</Label>
          <Input
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="e.g. tactics, lore, decrees"
            className="max-w-[200px] h-8 text-sm border-border bg-card text-foreground"
          />
        </div>

        {/* Content */}
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Begin writing… (Markdown supported)"
          className="min-h-[400px] resize-none border-none bg-transparent text-foreground/90 leading-relaxed placeholder:text-muted-foreground/30 focus-visible:ring-0 p-0"
        />

        {/* Controls */}
        <div className="mt-8 flex items-center justify-between rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <Switch
              id="sealed"
              checked={isSealed}
              onCheckedChange={setIsSealed}
            />
            <Label htmlFor="sealed" className="text-sm text-muted-foreground cursor-pointer">
              {isSealed ? "Sealed (subscribers only)" : "Unsealed (public)"}
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={saveDraft}
              disabled={saving}
              className="border-border text-foreground"
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving…" : "Save Draft"}
            </Button>
            <Button
              onClick={dispatch}
              disabled={dispatching}
              className="bg-primary text-primary-foreground hover:bg-primary/80"
            >
              <Send className="mr-2 h-4 w-4" />
              {dispatching ? "Dispatching…" : "Dispatch"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrollEditor;
