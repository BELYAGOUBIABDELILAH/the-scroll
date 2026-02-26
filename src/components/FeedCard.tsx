import { Link } from "react-router-dom";
import { format } from "date-fns";
import { MessageCircle, Heart, Clock } from "lucide-react";

interface FeedCardProps {
  id: string;
  title: string;
  excerpt: string | null;
  is_sealed: boolean;
  published_at: string | null;
  author_name: string;
  author_id?: string;
  author_avatar?: string | null;
  tag?: string;
  comment_count?: number;
  like_count?: number;
}

export const FeedCard = ({
  id,
  title,
  excerpt,
  is_sealed,
  published_at,
  author_name,
  author_id,
  author_avatar,
  tag,
  comment_count = 0,
  like_count = 0,
}: FeedCardProps) => {
  const readTime = excerpt ? Math.max(1, Math.ceil(excerpt.length / 200)) : 2;
  const initials = author_name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Link
      to={`/scroll/${id}`}
      className="group block rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
    >
      {/* Author row */}
      <div className="mb-3 flex items-center gap-3">
        {author_avatar ? (
          <img src={author_avatar} alt={author_name} className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
            {initials}
          </div>
        )}
        <div className="flex items-center gap-2 text-sm">
          {author_id ? (
            <Link
              to={`/scribe/${author_id}`}
              className="font-medium text-foreground hover:text-primary transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {author_name}
            </Link>
          ) : (
            <span className="font-medium text-foreground">{author_name}</span>
          )}
          {published_at && (
            <>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">{format(new Date(published_at), "MMM d")}</span>
            </>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="font-serif text-xl font-bold leading-tight text-foreground group-hover:text-primary transition-colors mb-2">
        {title}
      </h3>

      {/* Excerpt */}
      {excerpt && (
        <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2 mb-4">
          {excerpt}
        </p>
      )}

      {/* Bottom meta */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        {tag && tag !== "general" && (
          <span className="rounded-full bg-secondary px-2.5 py-0.5 font-medium capitalize text-secondary-foreground">
            {tag}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {readTime} min read
        </span>
        {comment_count > 0 && (
          <span className="flex items-center gap-1">
            <MessageCircle className="h-3 w-3" />
            {comment_count}
          </span>
        )}
        {like_count > 0 && (
          <span className="flex items-center gap-1">
            <Heart className="h-3 w-3" />
            {like_count}
          </span>
        )}
        {is_sealed && (
          <span className="font-medium text-primary">Sealed</span>
        )}
      </div>
    </Link>
  );
};
