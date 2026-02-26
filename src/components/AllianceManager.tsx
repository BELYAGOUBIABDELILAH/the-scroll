import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Trash2, ChevronUp, ChevronDown, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AllianceRow {
  id: string;
  allied_user_id: string;
  description: string;
  display_order: number;
  profile: { display_name: string | null; avatar_url: string | null } | null;
}

export const AllianceManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [newUserId, setNewUserId] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const { data: alliances = [], isLoading } = useQuery({
    queryKey: ["manage-alliances", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("alliances")
        .select("id, allied_user_id, description, display_order")
        .eq("scribe_id", user!.id)
        .order("display_order", { ascending: true });
      if (!data?.length) return [];
      const ids = data.map((a) => a.allied_user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", ids);
      const map = new Map((profiles ?? []).map((p) => [p.user_id, p]));
      return data.map((a) => ({ ...a, profile: map.get(a.allied_user_id) ?? null })) as AllianceRow[];
    },
    enabled: !!user,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["manage-alliances"] });
    queryClient.invalidateQueries({ queryKey: ["alliances"] });
  };

  const addMutation = useMutation({
    mutationFn: async () => {
      if (!user || !newUserId.trim()) return;
      // Look up user by display_name
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("display_name", newUserId.trim())
        .single();
      if (!profile) throw new Error("User not found by display name");
      const nextOrder = alliances.length > 0 ? Math.max(...alliances.map((a) => a.display_order)) + 1 : 0;
      const { error } = await supabase.from("alliances").insert({
        scribe_id: user.id,
        allied_user_id: profile.user_id,
        description: newDescription.trim() || "",
        display_order: nextOrder,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setNewUserId("");
      setNewDescription("");
      invalidate();
      toast({ title: "Alliance forged" });
    },
    onError: (e: any) => {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("alliances").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const reorderMutation = useMutation({
    mutationFn: async ({ id, direction }: { id: string; direction: "up" | "down" }) => {
      const idx = alliances.findIndex((a) => a.id === id);
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= alliances.length) return;
      const current = alliances[idx];
      const swap = alliances[swapIdx];
      await Promise.all([
        supabase.from("alliances").update({ display_order: swap.display_order }).eq("id", current.id),
        supabase.from("alliances").update({ display_order: current.display_order }).eq("id", swap.id),
      ]);
    },
    onSuccess: invalidate,
  });

  const updateDescMutation = useMutation({
    mutationFn: async ({ id, description }: { id: string; description: string }) => {
      const { error } = await supabase.from("alliances").update({ description }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return (
    <div className="space-y-4">
      {/* Add new alliance */}
      <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-1">
          <label className="text-xs text-muted-foreground">Display Name</label>
          <Input
            value={newUserId}
            onChange={(e) => setNewUserId(e.target.value)}
            placeholder="Ally's display name"
            className="h-9 text-sm"
          />
        </div>
        <div className="flex-1 space-y-1">
          <label className="text-xs text-muted-foreground">Tagline (3 words)</label>
          <Input
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="e.g. Strategy & Lore"
            className="h-9 text-sm"
          />
        </div>
        <Button
          size="sm"
          onClick={() => addMutation.mutate()}
          disabled={addMutation.isPending || !newUserId.trim()}
          className="bg-primary text-primary-foreground hover:bg-primary/80"
        >
          <Plus className="mr-1 h-4 w-4" />
          Add
        </Button>
      </div>

      {/* List */}
      {isLoading && <p className="text-sm text-muted-foreground py-6 text-center">Loading…</p>}
      {!isLoading && alliances.length === 0 && (
        <p className="text-sm text-muted-foreground py-6 text-center">No alliances yet.</p>
      )}
      {alliances.map((a, idx) => {
        const name = a.profile?.display_name ?? "Unknown";
        const initial = name[0]?.toUpperCase() ?? "?";
        return (
          <div
            key={a.id}
            className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
          >
            <Avatar className="h-8 w-8 shrink-0" style={{ filter: "grayscale(100%)" }}>
              {a.profile?.avatar_url && <AvatarImage src={a.profile.avatar_url} alt={name} />}
              <AvatarFallback className="text-xs bg-secondary text-muted-foreground">{initial}</AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground leading-tight">{name}</p>
              <input
                className="mt-0.5 w-full bg-transparent text-xs text-muted-foreground outline-none placeholder:text-muted-foreground/50"
                value={a.description}
                placeholder="Add tagline…"
                onChange={(e) => {
                  // Optimistic local update handled by invalidation on blur
                  const el = e.target;
                  el.dataset.dirty = "1";
                  el.dataset.value = e.target.value;
                }}
                onBlur={(e) => {
                  if (e.target.dataset.dirty === "1") {
                    updateDescMutation.mutate({ id: a.id, description: e.target.value });
                    e.target.dataset.dirty = "0";
                  }
                }}
                defaultValue={a.description}
              />
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground"
                disabled={idx === 0}
                onClick={() => reorderMutation.mutate({ id: a.id, direction: "up" })}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground"
                disabled={idx === alliances.length - 1}
                onClick={() => reorderMutation.mutate({ id: a.id, direction: "down" })}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={() => deleteMutation.mutate(a.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
