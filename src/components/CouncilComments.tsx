import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

interface CouncilCommentsProps {
  scrollId: string;
  authorId: string;
}

interface CommentWithProfile {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profile: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

export const CouncilComments = ({ scrollId, authorId }: CouncilCommentsProps) => {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const queryClient = useQueryClient();

  const { data: comments = [] } = useQuery({
    queryKey: ["council-comments", scrollId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("id, content, created_at, user_id")
        .eq("scroll_id", scrollId)
        .order("created_at", { ascending: true });
      if (error) throw error;

      // Fetch profiles for all unique user_ids
      const userIds = [...new Set(data.map((c) => c.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);

      const profileMap = new Map(
        (profiles || []).map((p) => [p.user_id, p])
      );

      return data.map((c) => ({
        ...c,
        profile: profileMap.get(c.user_id) || null,
      })) as CommentWithProfile[];
    },
  });

  const postMutation = useMutation({
    mutationFn: async (text: string) => {
      const { error } = await supabase
        .from("comments")
        .insert({ scroll_id: scrollId, user_id: user!.id, content: text });
      if (error) throw error;
    },
    onSuccess: () => {
      setContent("");
      queryClient.invalidateQueries({ queryKey: ["council-comments", scrollId] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    postMutation.mutate(content.trim());
  };

  return (
    <section className="mt-16 pt-8" style={{ borderTop: "1px solid #1A1A1A" }}>
      <h2
        className="font-serif-display text-2xl font-bold mb-8"
        style={{ color: "#EBEBEB" }}
      >
        The Council
      </h2>

      {/* Input gate */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-10">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts with the realm..."
            rows={3}
            className="w-full rounded-md px-4 py-3 text-sm resize-none focus:outline-none focus:ring-1"
            style={{
              backgroundColor: "#121212",
              border: "1px solid #27272A",
              color: "#E5E5E5",
              fontFamily: "'Inter', sans-serif",
            }}
          />
          <div className="flex justify-end mt-3">
            <button
              type="submit"
              disabled={postMutation.isPending || !content.trim()}
              className="px-5 py-2 rounded-md text-sm font-medium transition-opacity disabled:opacity-40"
              style={{ backgroundColor: "#8B0000", color: "#F5F5F5" }}
            >
              {postMutation.isPending ? "…" : "Post"}
            </button>
          </div>
        </form>
      ) : (
        <p className="mb-10 text-sm" style={{ color: "#71717A" }}>
          <Link to="/auth" className="underline hover:opacity-80" style={{ color: "#A1A1AA" }}>
            Sign in
          </Link>{" "}
          to join the discussion.
        </p>
      )}

      {/* Comment feed */}
      <div className="flex flex-col gap-4">
        {comments.map((comment) => {
          const isAuthor = comment.user_id === authorId;
          const initial = comment.profile?.display_name?.[0]?.toUpperCase() || "?";

          return (
            <div
              key={comment.id}
              className="rounded-lg p-5"
              style={{
                backgroundColor: "#0D0D0D",
                border: isAuthor ? "1px solid #8B0000" : "1px solid #1A1A1A",
                boxShadow: isAuthor ? "0 0 8px rgba(139,0,0,0.3)" : "none",
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-7 w-7">
                  {comment.profile?.avatar_url ? (
                    <AvatarImage src={comment.profile.avatar_url} />
                  ) : null}
                  <AvatarFallback
                    className="text-[10px]"
                    style={{ backgroundColor: "#1A1A1A", color: "#A1A1AA" }}
                  >
                    {initial}
                  </AvatarFallback>
                </Avatar>
                <span
                  className="text-sm font-semibold"
                  style={{ color: "#E5E5E5", fontFamily: "'Inter', sans-serif" }}
                >
                  {comment.profile?.display_name || "Anonyme"}
                </span>
                {isAuthor && (
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded"
                    style={{ color: "#8B0000", border: "1px solid #8B0000" }}
                  >
                    Author
                  </span>
                )}
                <span
                  className="text-xs ml-auto"
                  style={{ color: "#52525B", fontFamily: "'Inter', sans-serif" }}
                >
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                </span>
              </div>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "#D4D4D8", fontFamily: "'Inter', sans-serif" }}
              >
                {comment.content}
              </p>
            </div>
          );
        })}

        {comments.length === 0 && (
          <p className="text-sm text-center py-8" style={{ color: "#52525B" }}>
            No comments yet. Be the first to speak.
          </p>
        )}
      </div>
    </section>
  );
};
