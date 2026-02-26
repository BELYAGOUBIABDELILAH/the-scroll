import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { format, subDays } from "date-fns";

export const SubscriberChart = () => {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["subscriber-growth", user?.id],
    queryFn: async () => {
      const days = 30;
      const startDate = subDays(new Date(), days).toISOString();

      const [{ data: emailSubs }, { data: accountSubs }] = await Promise.all([
        supabase
          .from("email_subscribers")
          .select("created_at")
          .gte("created_at", startDate)
          .order("created_at"),
        supabase
          .from("subscriptions")
          .select("created_at")
          .eq("scribe_id", user!.id)
          .gte("created_at", startDate)
          .order("created_at"),
      ]);

      // Group by day
      const dayMap = new Map<string, number>();
      for (let i = 0; i <= days; i++) {
        const day = format(subDays(new Date(), days - i), "MMM d");
        dayMap.set(day, 0);
      }

      [...(emailSubs ?? []), ...(accountSubs ?? [])].forEach((s) => {
        const day = format(new Date(s.created_at), "MMM d");
        dayMap.set(day, (dayMap.get(day) ?? 0) + 1);
      });

      // Cumulative
      let cumulative = 0;
      return Array.from(dayMap.entries()).map(([day, count]) => {
        cumulative += count;
        return { day, subscribers: cumulative, new: count };
      });
    },
    enabled: !!user,
  });

  if (isLoading) return <Skeleton className="h-48 w-full rounded-lg" />;

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Subscriber Growth (30 days)
      </h3>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data}>
          <XAxis
            dataKey="day"
            tick={{ fontSize: 10, fill: "hsl(0 0% 50%)" }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(0 0% 9%)",
              border: "1px solid hsl(0 0% 16%)",
              borderRadius: "8px",
              fontSize: 12,
              color: "hsl(0 0% 92%)",
            }}
          />
          <Line
            type="monotone"
            dataKey="subscribers"
            stroke="hsl(0 72% 45%)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
