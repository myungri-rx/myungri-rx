
import { cn } from "@/lib/utils";

interface HeaderProps {
  compact?: boolean;
}

export function Header({ compact = false }: HeaderProps) {
  if (!compact) return null;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-white/[0.05] px-4 py-3",
      )}
      style={{
        background: "rgba(15,23,42,0.8)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <div className="mx-auto max-w-5xl flex items-center justify-between">
        <h1 className="font-display font-bold text-xl text-gradient-gold">
          Saju49
        </h1>
        <p className="text-xs text-text-secondary hidden md:block">
          30년 전문가의 사주명리 분석
        </p>
      </div>
    </header>
  );
}
