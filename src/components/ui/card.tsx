"use client";

import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-text-secondary/10 bg-surface p-6",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
