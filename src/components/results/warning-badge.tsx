"use client";

interface WarningBadgeProps {
  items: string[];
  label: string;
}

export function WarningBadge({ items, label }: WarningBadgeProps) {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="inline-flex items-center gap-1 rounded-full bg-red-500/20 border border-red-500/30 px-3 py-1 text-xs text-red-400"
        >
          <span className="text-red-400">!</span>
          {item}
        </span>
      ))}
    </div>
  );
}
