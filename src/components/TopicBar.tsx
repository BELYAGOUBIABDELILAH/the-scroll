import { Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";

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
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <div className="space-y-3">
      {/* Search + Sort row */}
      <div className="flex items-center gap-3">
        <div className={`relative flex-1 transition-all duration-200 ${isSearchFocused ? "ring-2 ring-primary/20 rounded-xl" : ""}`}>
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            placeholder="Search posts, authors..."
            className="w-full rounded-xl border border-border bg-card/80 backdrop-blur-sm pl-10 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/40 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Sort pills */}
        <div className="hidden shrink-0 items-center gap-0.5 rounded-xl border border-border bg-card/80 p-1 sm:flex">
          {sortOptions.map((s) => (
            <button
              key={s.value}
              onClick={() => onSortChange(s.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                sortBy === s.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Topic tags - scrollable chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
        {allTags.map((tag) => {
          const isActive = tag === activeTag;
          return (
            <button
              key={tag}
              onClick={() => onTagChange(tag)}
              className={`shrink-0 rounded-lg px-3.5 py-1.5 text-xs font-semibold capitalize transition-all duration-200 border ${
                isActive
                  ? "border-primary/30 bg-primary/10 text-primary shadow-sm shadow-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/60 hover:border-border"
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  );
};
