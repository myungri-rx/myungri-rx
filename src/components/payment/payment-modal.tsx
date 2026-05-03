import { useState } from "react";
import type { OrderPayload, PgProvider } from "@/lib/payment";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  payload: OrderPayload | null;
  teaserText: string;
  onSlotFull: (slotCount: number, slotMax: number) => void;
}

const PRICE_LABEL = "1,650원";

export function PaymentModal({ open, onClose, payload, teaserText, onSlotFull }: PaymentModalProps) {
  const [busyMethod, setBusyMethod] = useState<PgProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!open || !payload) return null;

  const startPayment = async (provider: PgProvider) => {
    setError(null);
    setBusyMethod(provider);
    try {
      const res = await fetch("/api/payment/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ pgProvider: provider, payload, teaserText }),
      });

      if (res.status === 403) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          slotCount?: number;
          slotMax?: number;
        };
        if (data.error === "slot_full") {
          onSlotFull(data.slotCount ?? 10, data.slotMax ?? 10);
          return;
        }
      }
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(data.message || "결제 준비에 실패했습니다.");
      }
      const data = (await res.json()) as { redirectUrl: string; mobileRedirectUrl?: string };
      const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
      window.location.href = isMobile && data.mobileRedirectUrl ? data.mobileRedirectUrl : data.redirectUrl;
    } catch (e) {
      setError(e instanceof Error ? e.message : "결제 준비 중 오류가 발생했습니다.");
      setBusyMethod(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="glass-card-elevated max-w-sm w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-5">
          <h3 className="font-display text-xl font-bold text-gradient-gold">전체 분석 잠금 해제</h3>
          <p className="mt-2 text-sm text-text-secondary">
            6대 운세 · 대운/세운 타임라인 · 맞춤 처방까지<br />
            결제 후 보기
          </p>
          <p className="mt-3 text-2xl font-bold text-text-primary">{PRICE_LABEL}</p>
        </div>

        <div className="space-y-2">
          <PayButton
            label="카카오페이"
            bg="bg-[#FEE500]"
            fg="text-[#3C1E1E]"
            onClick={() => startPayment("kakao")}
            disabled={busyMethod !== null}
            loading={busyMethod === "kakao"}
          />
          <PayButton
            label="네이버페이 (준비중)"
            bg="bg-[#03C75A]/40"
            fg="text-white/60"
            onClick={() => {}}
            disabled
          />
          <PayButton
            label="토스페이 (준비중)"
            bg="bg-[#0064FF]/40"
            fg="text-white/60"
            onClick={() => {}}
            disabled
          />
        </div>

        {error && (
          <div className="mt-3 rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-400">
            {error}
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full text-xs text-text-secondary hover:text-text-primary py-2"
        >
          닫기
        </button>
      </div>
    </div>
  );
}

function PayButton({
  label,
  bg,
  fg,
  onClick,
  disabled,
  loading,
}: {
  label: string;
  bg: string;
  fg: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center justify-center gap-2 rounded-xl ${bg} ${fg} px-4 py-3 text-sm font-semibold shadow-md transition disabled:cursor-not-allowed enabled:hover:brightness-95`}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      <span>{label}</span>
    </button>
  );
}
