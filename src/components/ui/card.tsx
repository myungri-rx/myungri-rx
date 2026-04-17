
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "default" | "elevated" | "outline";
}

export function Card({ className, children, variant = "default", ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl p-6",
        variant === "default" && "glass-card",
        variant === "elevated" && "glass-card-elevated",
        variant === "outline" &&
          "bg-transparent border border-white/[0.08] rounded-2xl",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
