import { Search } from "lucide-react";

interface TopicBarProps {
  tags: string[];
  activeTag: string;
  onTagChange: (tag: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

const sortOptions = [
  { value: "latest", label: "Latest" },
  { value: "popular", label: "Popular" },
  { value: "trending", label: "Trending" },
];

export const TopicBar = ({
  tags,
  activeTag,
  onTagChange,
  sortBy,
  onSortChange,
  searchQuery,
  onSearchChange,
}: TopicBarProps) => {
  const allTags = ["All", ...tags];

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search posts..."
          className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Topics + Sort */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
          {allTags.map((tag) => {
            const isActive = tag === activeTag;
            return (
              <button
                key={tag}
                onClick={() => onTagChange(tag)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>

        <div className="hidden shrink-0 items-center gap-1 sm:flex">
          {sortOptions.map((s) => (
            <button
              key={s.value}
              onClick={() => onSortChange(s.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                sortBy === s.value
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
