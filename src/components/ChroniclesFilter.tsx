interface ChroniclesFilterProps {
  tags: string[];
  activeTag: string;
  onTagChange: (tag: string) => void;
}

export const ChroniclesFilter = ({ tags, activeTag, onTagChange }: ChroniclesFilterProps) => {
  const allTags = ["All", ...tags];

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {allTags.map((tag) => {
        const isActive = tag === activeTag;
        return (
          <button
            key={tag}
            onClick={() => onTagChange(tag)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-150 ${
              isActive
                ? "border text-white"
                : "border border-transparent bg-transparent"
            }`}
            style={
              isActive
                ? { backgroundColor: "#18181B", color: "#FFFFFF", borderColor: "#27272A" }
                : { color: "#71717A" }
            }
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
};
