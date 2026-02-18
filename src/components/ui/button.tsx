"use client";

import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" &&
          "bg-primary text-white hover:bg-primary/90",
        variant === "secondary" &&
          "bg-surface text-text-primary border border-text-secondary/20 hover:bg-surface/80",
        variant === "ghost" &&
          "text-text-secondary hover:text-text-primary hover:bg-surface/50",
        size === "sm" && "h-8 px-3 text-sm",
        size === "md" && "h-10 px-4",
        size === "lg" && "h-12 px-6 text-lg",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
