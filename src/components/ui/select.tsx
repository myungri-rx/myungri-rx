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
        <label htmlFor={id} className="text-sm text-text-secondary">
          {label}
        </label>
      )}
      <select
        id={id}
        className={cn(
          "h-10 w-full rounded-lg border border-text-secondary/20 bg-surface px-3 text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary",
          className,
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
