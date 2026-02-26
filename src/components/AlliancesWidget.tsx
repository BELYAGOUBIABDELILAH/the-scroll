import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Alliance {
  id: string;
  allied_user_id: string;
  description: string;
  display_order: number;
  profile: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface AlliancesWidgetProps {
  scribeId: string;
}

export const AlliancesWidget = ({ scribeId }: AlliancesWidgetProps) => {
  const { data: alliances = [] } = useQuery({
    queryKey: ["alliances", scribeId],
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
      })) as Alliance[];
    },
    enabled: !!scribeId,
  });

  if (!alliances.length) return null;

  return (
    <div
      className="rounded-lg p-6"
      style={{
        backgroundColor: "#080808",
        border: "1px solid #1A1A1A",
      }}
    >
      <h3
        className="mb-4 font-serif-display text-lg font-semibold"
        style={{ color: "#A1A1AA" }}
      >
        Alliances
      </h3>

      <div className="flex flex-col">
        {alliances.map((alliance) => {
          const name = alliance.profile?.display_name ?? "Unknown";
          const initial = name[0]?.toUpperCase() ?? "?";

          return (
            <a
              key={alliance.id}
              href="#"
              onClick={(e) => e.preventDefault()}
              className="-mx-3 flex items-center gap-3 rounded-md px-3 py-3 transition-colors"
              style={{ backgroundColor: "transparent" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#121212")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <Avatar className="h-8 w-8" style={{ filter: "grayscale(100%)" }}>
                {alliance.profile?.avatar_url ? (
                  <AvatarImage
                    src={alliance.profile.avatar_url}
                    alt={name}
                  />
                ) : null}
                <AvatarFallback
                  className="text-xs"
                  style={{ backgroundColor: "#1A1A1A", color: "#A1A1AA" }}
                >
                  {initial}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <p
                  className="text-sm font-medium leading-tight"
                  style={{ color: "#FFFFFF" }}
                >
                  {name}
                </p>
                {alliance.description && (
                  <p
                    className="text-xs leading-tight"
                    style={{ color: "#71717A" }}
                  >
                    {alliance.description}
                  </p>
                )}
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};
