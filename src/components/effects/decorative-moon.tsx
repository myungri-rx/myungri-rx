
import { cn } from "@/lib/utils";

interface DecorativeMoonProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_MAP = {
  sm: "w-16 h-16",
  md: "w-32 h-32",
  lg: "w-48 h-48",
};

export function DecorativeMoon({ size = "md", className }: DecorativeMoonProps) {
  return (
    <div
      className={cn(
        "rounded-full animate-moon-glow",
        SIZE_MAP[size],
        className,
      )}
      style={{
        background:
          "radial-gradient(circle at 35% 35%, #F5E6B8 0%, #D4AF37 30%, #B8860B 60%, rgba(107,33,168,0.3) 100%)",
      }}
    />
  );
}
