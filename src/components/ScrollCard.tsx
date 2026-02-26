import { Link } from "react-router-dom";
import { format } from "date-fns";

interface ScrollCardProps {
  id: string;
  title: string;
  excerpt: string | null;
  is_sealed: boolean;
  published_at: string | null;
  author_name: string;
  author_id?: string;
  tag?: string;
  featured?: boolean;
}

export const ScrollCard = ({
  id,
  title,
  excerpt,
  is_sealed,
  published_at,
  author_name,
  author_id,
  tag,
}: ScrollCardProps) => {
  return (
    <Link
      to={`/scroll/${id}`}
      className="group block py-6 transition-colors"
      style={{ borderBottom: "1px solid #1A1A1A" }}
    >
      <div className="flex items-center gap-3 mb-2">
        {author_id ? (
          <Link
            to={`/scribe/${author_id}`}
            className="text-xs font-medium hover:opacity-70 transition-opacity"
            style={{ color: "#52525B" }}
            onClick={(e) => e.stopPropagation()}
          >
            {author_name}
          </Link>
        ) : (
          <span className="text-xs font-medium" style={{ color: "#52525B" }}>
            {author_name}
          </span>
        )}
        {published_at && (
          <>
            <span style={{ color: "#27272A" }}>·</span>
            <span className="text-xs" style={{ color: "#3F3F46" }}>
              {format(new Date(published_at), "d MMM yyyy")}
            </span>
          </>
        )}
        {tag && tag !== "general" && (
          <>
            <span style={{ color: "#27272A" }}>·</span>
            <span className="text-xs font-medium capitalize" style={{ color: "#52525B" }}>
              {tag}
            </span>
          </>
        )}
        {is_sealed && (
          <>
            <span style={{ color: "#27272A" }}>·</span>
            <span className="text-xs font-medium" style={{ color: "#8B0000" }}>
              Scellé
            </span>
          </>
        )}
      </div>

      <h3
        className="font-serif-display text-lg font-bold mb-1 group-hover:opacity-80 transition-opacity"
        style={{ color: "#EBEBEB" }}
      >
        {title}
      </h3>

      {excerpt && (
        <p className="text-sm line-clamp-2 leading-relaxed" style={{ color: "#71717A" }}>
          {excerpt}
        </p>
      )}
    </Link>
  );
};
