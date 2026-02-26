import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { DashboardSidebar, SIDEBAR_MARGIN } from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Send, Save, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TAG_OPTIONS = ["general", "tactics", "lore", "decrees", "chronicles"];

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
  const [loaded, setLoaded] = useState(!id);

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
            title, content, excerpt, is_sealed: isSealed, tag,
            status: "published", published_at: new Date().toISOString(),
          } as any)
          .eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("scrolls").insert({
          title, content, excerpt, is_sealed: isSealed, tag,
          author_id: user.id, status: "published", published_at: new Date().toISOString(),
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
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar activeTab="drafts" onTabChange={() => navigate("/dashboard")} />

      <main className={`flex-1 ${SIDEBAR_MARGIN}`}>
        {/* Top bar with tag + actions */}
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-sm px-8 py-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch
                id="sealed"
                checked={isSealed}
                onCheckedChange={setIsSealed}
              />
              <Label htmlFor="sealed" className="text-xs text-muted-foreground cursor-pointer">
                {isSealed ? "Sealed" : "Public"}
              </Label>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tag dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium capitalize text-muted-foreground transition-colors hover:text-foreground">
                  {tag}
                  <ChevronDown className="h-3 w-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover border-border z-[60]">
                {TAG_OPTIONS.map((t) => (
                  <DropdownMenuItem
                    key={t}
                    onClick={() => setTag(t)}
                    className={`capitalize ${tag === t ? "text-primary" : ""}`}
                  >
                    {t}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="sm"
              onClick={saveDraft}
              disabled={saving}
              className="border-border text-foreground"
            >
              <Save className="mr-1.5 h-3.5 w-3.5" />
              {saving ? "Saving…" : "Save"}
            </Button>

            <Button
              size="sm"
              onClick={dispatch}
              disabled={dispatching}
              className="bg-primary text-primary-foreground hover:bg-primary/80"
            >
              <Send className="mr-1.5 h-3.5 w-3.5" />
              {dispatching ? "…" : "Dispatch"}
            </Button>
          </div>
        </div>

        {/* Writing canvas */}
        <div className="mx-auto max-w-3xl px-8 pt-12 pb-32">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title of your scroll…"
            className="mb-8 border-none bg-transparent font-serif text-4xl font-bold text-foreground placeholder:text-muted-foreground/30 focus-visible:ring-0 p-0 h-auto"
          />

          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Begin writing… (Markdown supported)"
            className="min-h-[500px] resize-none border-none bg-transparent text-foreground/90 text-base leading-[1.8] placeholder:text-muted-foreground/20 focus-visible:ring-0 p-0"
          />
        </div>
      </main>
    </div>
  );
};

export default ScrollEditor;
