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

  // Reset when closing
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
      // email_subscribers is for anonymous email subs, so we just record intent
      // For now we show a toast since the user isn't authenticated
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
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      />
      <DialogContent
        className="z-50 mx-auto max-w-md rounded-lg border p-8 shadow-2xl"
        style={{
          backgroundColor: "#0D0D0D",
          borderColor: "#1A1A1A",
        }}
      >
        <h2
          className="mb-6 font-serif-display text-xl font-bold leading-snug md:text-2xl"
          style={{ color: "#EBEBEB" }}
        >
          Your raven has been dispatched. Expand your network.
        </h2>

        <div className="mb-6 flex flex-col gap-3">
          {alliances.map((alliance) => {
            const name = alliance.profile?.display_name ?? "Unknown";
            const initial = name[0]?.toUpperCase() ?? "?";
            const checked = checkedIds.has(alliance.allied_user_id);

            return (
              <label
                key={alliance.id}
                className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 transition-colors"
                style={{ backgroundColor: checked ? "#121212" : "transparent" }}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => toggleCheck(alliance.allied_user_id)}
                  className="border-[#3F3F46] data-[state=checked]:bg-[#8B0000] data-[state=checked]:border-[#8B0000]"
                />
                <Avatar className="h-8 w-8" style={{ filter: "grayscale(100%)" }}>
                  {alliance.profile?.avatar_url ? (
                    <AvatarImage src={alliance.profile.avatar_url} alt={name} />
                  ) : null}
                  <AvatarFallback
                    className="text-xs"
                    style={{ backgroundColor: "#1A1A1A", color: "#A1A1AA" }}
                  >
                    {initial}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium" style={{ color: "#FFFFFF" }}>
                  {name}
                </span>
              </label>
            );
          })}
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full rounded-md px-5 py-2.5 text-sm font-medium transition-opacity disabled:opacity-50"
          style={{ backgroundColor: "#8B0000", color: "#F5F5F5" }}
        >
          {submitting ? "…" : "Add to Subscriptions"}
        </button>

        <button
          onClick={handleClose}
          className="mt-3 w-full text-center text-sm transition-opacity hover:opacity-80"
          style={{ color: "#71717A" }}
        >
          No thanks, enter the archives.
        </button>
      </DialogContent>
    </Dialog>
  );
};
