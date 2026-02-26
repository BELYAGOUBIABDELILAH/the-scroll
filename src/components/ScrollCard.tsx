import { Link } from "react-router-dom";
import { format } from "date-fns";

interface ScrollCardProps {
  id: string;
  title: string;
  excerpt: string | null;
  is_sealed: boolean;
  published_at: string | null;
  author_name: string;
  featured?: boolean;
}

export const ScrollCard = ({
  id,
  title,
  excerpt,
  is_sealed,
  published_at,
  author_name,
  featured = false,
}: ScrollCardProps) => {
  return (
    <Link
      to={`/scroll/${id}`}
      className={`group block rounded-lg border border-border bg-card p-6 transition-all hover:border-primary/30 hover:bg-card/80 ${
        featured ? "sm:col-span-2 lg:col-span-2 lg:row-span-2 lg:p-10" : ""
      }`}
    >
      <div className="mb-3 flex items-center gap-2">
        {is_sealed && (
          <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            Sealed
          </span>
        )}
        {!is_sealed && (
          <span className="rounded-full border border-scroll-gold/30 bg-scroll-gold/10 px-2.5 py-0.5 text-xs font-medium text-scroll-gold">
            Unsealed
          </span>
        )}
        {published_at && (
          <span className="text-xs text-muted-foreground">
            {format(new Date(published_at), "MMM d, yyyy")}
          </span>
        )}
      </div>
      <h3
        className={`mb-2 font-serif font-bold text-foreground ${
          featured ? "text-2xl lg:text-3xl" : "text-lg"
        }`}
      >
        {title}
      </h3>
      {excerpt && (
        <p
          className={`mb-4 line-clamp-2 leading-relaxed text-muted-foreground ${
            featured ? "text-base" : "text-sm"
          }`}
        >
          {excerpt}
        </p>
      )}
      <p className="text-xs font-medium text-muted-foreground">
        by <span className="text-foreground">{author_name}</span>
      </p>
    </Link>
  );
};
