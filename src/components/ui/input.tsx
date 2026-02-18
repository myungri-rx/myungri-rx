"use client";

import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ className, label, id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm text-text-secondary">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          "h-10 w-full rounded-lg border border-text-secondary/20 bg-surface px-3 text-text-primary placeholder:text-text-secondary/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary",
          className,
        )}
        {...props}
      />
    </div>
  );
}
