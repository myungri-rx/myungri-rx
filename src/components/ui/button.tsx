"use client";

import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "dramatic";
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
        "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" &&
          "bg-primary text-white hover:bg-primary/90",
        variant === "secondary" &&
          "bg-surface text-text-primary border border-text-secondary/20 hover:bg-surface/80",
        variant === "ghost" &&
          "text-text-secondary hover:text-text-primary hover:bg-surface/50",
        variant === "dramatic" &&
          "relative bg-gradient-to-r from-primary via-primary-light to-primary text-white border border-accent/40 shadow-[0_0_20px_rgba(212,175,55,0.15)] hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] hover:border-accent/70 active:scale-[0.98]",
        size === "sm" && "h-9 px-3 text-sm",
        size === "md" && "h-11 px-5",
        size === "lg" && "h-13 px-8 text-lg",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
