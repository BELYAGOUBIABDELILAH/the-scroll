import { Link } from "react-router-dom";
import { format, formatDistanceToNowStrict } from "date-fns";
import { MessageCircle, Heart, Clock, ArrowUpRight } from "lucide-react";

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

  const timeAgo = published_at
    ? formatDistanceToNowStrict(new Date(published_at), { addSuffix: true })
    : null;

  return (
    <Link
      to={`/scroll/${id}`}
      className="group relative block rounded-2xl border border-border/60 bg-card p-6 transition-all duration-300 hover:border-primary/20 hover:bg-accent/30 hover:shadow-xl hover:shadow-primary/[0.03] hover:-translate-y-0.5"
    >
      {/* Read arrow indicator */}
      <div className="absolute right-5 top-5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <ArrowUpRight className="h-4 w-4 text-primary" />
      </div>

      {/* Author row */}
      <div className="mb-4 flex items-center gap-3">
        {author_avatar ? (
          <img
            src={author_avatar}
            alt={author_name}
            className="h-9 w-9 rounded-full object-cover ring-2 ring-border/50"
          />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary ring-2 ring-primary/10">
            {initials}
          </div>
        )}
        <div className="flex flex-col">
          {author_id ? (
            <Link
              to={`/scribe/${author_id}`}
              className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {author_name}
            </Link>
          ) : (
            <span className="text-sm font-semibold text-foreground">{author_name}</span>
          )}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
            {timeAgo && <span>{timeAgo}</span>}
            <span>·</span>
            <span className="flex items-center gap-0.5">
              <Clock className="h-3 w-3" />
              {readTime} min
            </span>
          </div>
        </div>
      </div>

      {/* Title */}
      <h3 className="font-serif text-xl font-bold leading-snug text-foreground group-hover:text-primary transition-colors duration-200 mb-2 pr-6">
        {title}
      </h3>

      {/* Excerpt */}
      {excerpt && (
        <p className="text-sm leading-relaxed text-muted-foreground/80 line-clamp-2 mb-5">
          {excerpt}
        </p>
      )}

      {/* Bottom meta */}
      <div className="flex items-center gap-3 pt-4 border-t border-border/40">
        {tag && tag !== "general" && (
          <span className="rounded-md bg-primary/8 px-2.5 py-1 text-[11px] font-semibold capitalize text-primary/80">
            {tag}
          </span>
        )}
        <div className="flex items-center gap-3 ml-auto text-xs text-muted-foreground/60">
          {comment_count > 0 && (
            <span className="flex items-center gap-1 hover:text-foreground transition-colors">
              <MessageCircle className="h-3.5 w-3.5" />
              {comment_count}
            </span>
          )}
          {like_count > 0 && (
            <span className="flex items-center gap-1">
              <Heart className="h-3.5 w-3.5" />
              {like_count}
            </span>
          )}
          {is_sealed && (
            <span className="font-semibold text-primary text-[11px] uppercase tracking-wider">Sealed</span>
          )}
        </div>
      </div>
    </Link>
  );
};
