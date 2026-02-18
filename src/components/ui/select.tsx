"use client";

import { cn } from "@/lib/utils";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ className, label, id, options, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm text-text-secondary font-display">
          {label}
        </label>
      )}
      <select
        id={id}
        className={cn(
          "h-12 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm px-4 text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors",
          className,
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-surface text-text-primary">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
