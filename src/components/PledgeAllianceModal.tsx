import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface PledgeAllianceModalProps {
  scribeId: string;
  open: boolean;
  onClose: () => void;
}

export const PledgeAllianceModal = ({
  scribeId,
  open,
  onClose,
}: PledgeAllianceModalProps) => {
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [initialized, setInitialized] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { data: alliances = [] } = useQuery({
    queryKey: ["alliances-modal", scribeId],
    queryFn: async () => {
      const { data } = await supabase
        .from("alliances")
        .select("id, allied_user_id, description, display_order")
        .eq("scribe_id", scribeId)
        .order("display_order", { ascending: true });

      if (!data?.length) return [];

      const userIds = data.map((a) => a.allied_user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);

      const profileMap = new Map(
        (profiles ?? []).map((p) => [p.user_id, p])
      );

      return data.map((a) => ({
        ...a,
        profile: profileMap.get(a.allied_user_id) ?? null,
      }));
    },
    enabled: !!scribeId && open,
  });

  // Default all checked on first load
  if (alliances.length > 0 && !initialized) {
    setCheckedIds(new Set(alliances.map((a) => a.allied_user_id)));
    setInitialized(true);
  }

  const handleClose = () => {
    setInitialized(false);
    setCheckedIds(new Set());
    onClose();
  };

  const toggleCheck = (userId: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (checkedIds.size === 0) {
      handleClose();
      return;
    }
    setSubmitting(true);
    try {
      toast.success(`${checkedIds.size} alliance(s) noted. Welcome to the network.`);
      handleClose();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!alliances.length) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogOverlay
        className="fixed inset-0 z-50"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.75)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      />
      <DialogContent
        className="z-50 mx-auto max-w-md rounded-lg border p-0 shadow-2xl overflow-hidden"
        style={{
          backgroundColor: "#121212",
          borderColor: "#27272A",
        }}
      >
        <div className="px-8 pt-10 pb-2">
          <h2 className="mb-2 font-serif text-2xl font-bold leading-snug text-foreground">
            Your oath is recorded. Expand your network.
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Subscribe to allied writers recommended by this author.
          </p>
        </div>

        <div className="px-8 py-6 flex flex-col gap-1">
          {alliances.map((alliance) => {
            const name = alliance.profile?.display_name ?? "Unknown";
            const initial = name[0]?.toUpperCase() ?? "?";
            const checked = checkedIds.has(alliance.allied_user_id);

            return (
              <label
                key={alliance.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-secondary"
                style={{ backgroundColor: checked ? "rgba(139, 0, 0, 0.06)" : "transparent" }}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => toggleCheck(alliance.allied_user_id)}
                  className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Avatar className="h-9 w-9" style={{ filter: "grayscale(100%)" }}>
                  {alliance.profile?.avatar_url ? (
                    <AvatarImage src={alliance.profile.avatar_url} alt={name} />
                  ) : null}
                  <AvatarFallback className="bg-secondary text-xs text-muted-foreground">
                    {initial}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-medium text-foreground">{name}</span>
                  {alliance.description && (
                    <p className="text-xs text-muted-foreground truncate">{alliance.description}</p>
                  )}
                </div>
              </label>
            );
          })}
        </div>

        <div className="px-8 pb-8">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "…" : "Add to Subscriptions"}
          </button>

          <button
            onClick={handleClose}
            className="mt-4 w-full text-center text-sm text-muted-foreground transition-opacity hover:opacity-70"
          >
            No thanks, enter the archives.
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
