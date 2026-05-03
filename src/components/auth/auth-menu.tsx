import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface AuthMenuProps {
  variant?: "floating" | "inline";
  onOpenHistory?: () => void;
}

export function AuthMenu({ variant = "floating", onOpenHistory }: AuthMenuProps) {
  const { user, loading, loginWithKakao, loginWithNaver, logout } = useAuth();
  const [open, setOpen] = useState(false);

  if (loading) return null;

  const wrapperClass =
    variant === "floating"
      ? "fixed top-3 right-3 z-[60]"
      : "relative";

  if (!user) {
    return (
      <div className={`${wrapperClass} flex items-center gap-2`}>
        <button
          onClick={loginWithKakao}
          className="flex items-center gap-2 rounded-xl bg-[#FEE500] text-[#3C1E1E] px-4 py-2 text-sm font-semibold shadow-md hover:brightness-95 transition"
        >
          <KakaoIcon />
          카카오 로그인
        </button>
        <button
          onClick={loginWithNaver}
          className="flex items-center gap-2 rounded-xl bg-[#03C75A] text-white px-4 py-2 text-sm font-semibold shadow-md hover:brightness-95 transition"
        >
          <NaverIcon />
          네이버 로그인
        </button>
      </div>
    );
  }

  const isNaver = user.provider === "naver";
  const badgeClass = isNaver ? "bg-[#03C75A] text-white" : "bg-[#FEE500] text-[#3C1E1E]";

  return (
    <div className={wrapperClass}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur px-3 py-1.5 border border-white/10"
        aria-label="계정 메뉴"
      >
        <div className={`w-7 h-7 rounded-full flex items-center justify-center ${badgeClass}`}>
          {isNaver ? <NaverIcon /> : <KakaoIcon />}
        </div>
      </button>
      {open && (
        <div
          className="absolute right-0 mt-2 min-w-[160px] rounded-xl border border-white/10 bg-surface shadow-xl p-1"
          onMouseLeave={() => setOpen(false)}
        >
          {onOpenHistory && (
            <button
              onClick={() => {
                setOpen(false);
                onOpenHistory();
              }}
              className="w-full text-left px-3 py-2 text-sm text-text-primary rounded-lg hover:bg-white/5"
            >
              내 분석 기록
            </button>
          )}
          <button
            onClick={() => {
              setOpen(false);
              void logout();
            }}
            className="w-full text-left px-3 py-2 text-sm text-text-primary rounded-lg hover:bg-white/5"
          >
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}

function KakaoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 3C6.48 3 2 6.48 2 10.8c0 2.77 1.87 5.19 4.67 6.57-.2.7-.74 2.6-.84 3-.13.5.18.5.38.36.15-.1 2.4-1.63 3.38-2.3.79.12 1.6.18 2.41.18 5.52 0 10-3.48 10-7.81S17.52 3 12 3z" />
    </svg>
  );
}

function NaverIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.273 12.845 7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727z" />
    </svg>
  );
}
