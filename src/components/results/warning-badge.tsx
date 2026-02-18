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
          className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 border border-red-500/25 px-3 py-1.5 text-xs text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.15)]"
          title={`${label}: ${item}`}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="flex-shrink-0">
            <path d="M6 1L11 10H1L6 1Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M6 5V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="6" cy="8.5" r="0.5" fill="currentColor" />
          </svg>
          {item}
        </span>
      ))}
    </div>
  );
}
