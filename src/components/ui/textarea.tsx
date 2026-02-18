"use client";

import { cn } from "@/lib/utils";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function Textarea({ className, label, id, ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm text-text-secondary">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={cn(
          "w-full rounded-lg border border-text-secondary/20 bg-surface px-3 py-2 text-text-primary placeholder:text-text-secondary/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none",
          className,
        )}
        {...props}
      />
    </div>
  );
}
