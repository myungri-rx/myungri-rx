import { useAuth } from "@/contexts/AuthContext";

interface LoginRequiredModalProps {
  open: boolean;
  onClose: () => void;
}

export function LoginRequiredModal({ open, onClose }: LoginRequiredModalProps) {
  const { loginWithKakao, loginWithNaver } = useAuth();
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div className="glass-card-elevated max-w-sm w-full p-6 text-center" onClick={(e) => e.stopPropagation()}>
        <div className="text-3xl mb-2">🔒</div>
        <h3 className="font-display text-xl font-bold text-gradient-gold">로그인이 필요해요</h3>
        <p className="mt-2 text-sm text-text-secondary">
          전체 분석을 잠금 해제하려면 먼저 로그인해주세요.
          <br />
          분석은 언제든 다시 열람할 수 있어요.
        </p>
        <div className="mt-5 space-y-2">
          <button
            onClick={loginWithKakao}
            className="w-full rounded-xl bg-[#FEE500] text-[#3C1E1E] px-4 py-3 text-sm font-semibold hover:brightness-95"
          >
            카카오 로그인
          </button>
          <button
            onClick={loginWithNaver}
            className="w-full rounded-xl bg-[#03C75A] text-white px-4 py-3 text-sm font-semibold hover:brightness-95"
          >
            네이버 로그인
          </button>
          <button
            onClick={onClose}
            className="w-full text-xs text-text-secondary hover:text-text-primary py-2"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
