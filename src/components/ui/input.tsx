"use client";

import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ className, label, id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm text-text-secondary font-display">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          "h-12 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm px-4 text-text-primary placeholder:text-text-secondary/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors",
          className,
        )}
        {...props}
      />
    </div>
  );
}
