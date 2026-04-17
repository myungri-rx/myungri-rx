
import { useState, useEffect, useRef, useCallback } from "react";

declare global {
  interface Window {
    Kakao?: {
      isInitialized: () => boolean;
      init: (key: string) => void;
      Share: {
        sendDefault: (options: Record<string, unknown>) => void;
      };
    };
  }
}

interface ShareBarProps {
  /** Plain text of the AI analysis result */
  resultText: string;
  /** Data to save to Redis for link sharing */
  shareData: Record<string, unknown>;
}

type FeedbackKey = "copy" | "link" | "sms" | "kakao";

export function ShareBar({ resultText, shareData }: ShareBarProps) {
  const [feedback, setFeedback] = useState<FeedbackKey | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const kakaoInitialized = useRef(false);

  useEffect(() => {
    const kakaoKey = import.meta.env.VITE_KAKAO_JS_KEY as string | undefined;
    if (!kakaoKey) return;

    const tryInit = () => {
      if (window.Kakao && !window.Kakao.isInitialized()) {
        window.Kakao.init(kakaoKey);
        kakaoInitialized.current = true;
        return true;
      }
      return !!window.Kakao?.isInitialized();
    };

    if (tryInit()) return;

    let attempts = 0;
    const interval = setInterval(() => {
      if (tryInit() || ++attempts >= 10) clearInterval(interval);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const showFeedback = (key: FeedbackKey) => {
    setFeedback(key);
    setTimeout(() => setFeedback(null), 2000);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
  };

  // Save result to Redis and get share URL (cached after first call)
  const getShareUrl = useCallback(async (): Promise<string | null> => {
    if (shareUrl) return shareUrl;
    setSaving(true);
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(shareData),
      });
      if (!res.ok) throw new Error();
      const { id } = await res.json();
      const url = `${window.location.origin}/share?id=${id}`;
      setShareUrl(url);
      return url;
    } catch {
      alert("링크 생성에 실패했습니다. 다시 시도해주세요.");
      return null;
    } finally {
      setSaving(false);
    }
  }, [shareData, shareUrl]);

  const handleCopyLink = async () => {
    const url = await getShareUrl();
    if (!url) return;
    await copyToClipboard(url);
    showFeedback("link");
  };

  const handleSms = async () => {
    const url = await getShareUrl();
    if (!url) return;
    const body = encodeURIComponent(
      `[명리처방전] 사주 분석 결과를 확인해보세요!\n${url}`
    );
    window.open(`sms:?&body=${body}`, "_self");
  };

  const handleKakao = async () => {
    if (!window.Kakao?.isInitialized()) {
      alert("카카오톡 SDK가 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    const url = await getShareUrl();
    if (!url) return;
    window.Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title: "명리처방전 — 사주 분석 결과",
        description: "AI가 분석한 사주명리 결과를 확인해보세요!",
        imageUrl: `${window.location.origin}/og-image.png`,
        link: { mobileWebUrl: url, webUrl: url },
      },
      buttons: [
        { title: "결과 보기", link: { mobileWebUrl: url, webUrl: url } },
      ],
    });
    showFeedback("kakao");
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 pt-6">
      <ShareButton
        onClick={async () => {
          await copyToClipboard(resultText);
          showFeedback("copy");
        }}
        icon="📋"
        label={feedback === "copy" ? "복사됨!" : "결과 복사"}
        active={feedback === "copy"}
      />
      <ShareButton
        onClick={handleCopyLink}
        icon="🔗"
        label={saving ? "생성 중..." : feedback === "link" ? "복사됨!" : "링크 복사"}
        active={feedback === "link"}
        disabled={saving}
      />
      <ShareButton
        onClick={handleSms}
        icon="✉️"
        label="문자 공유"
        disabled={saving}
      />
      <ShareButton
        onClick={handleKakao}
        icon="💬"
        label={feedback === "kakao" ? "전송됨!" : "카카오톡"}
        active={feedback === "kakao"}
        disabled={saving}
      />
    </div>
  );
}

function ShareButton({
  onClick,
  icon,
  label,
  active,
  disabled,
}: {
  onClick: () => void;
  icon: string;
  label: string;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm transition-all duration-300 disabled:opacity-50
        ${
          active
            ? "bg-accent/20 border border-accent/50 text-accent"
            : "bg-surface/80 border border-white/10 text-text-secondary hover:text-text-primary hover:border-white/20 hover:bg-surface"
        }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
