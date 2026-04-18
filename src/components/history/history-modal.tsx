import { useEffect, useState } from "react";

export interface HistoryPreview {
  name?: string;
  names?: [string, string];
  relationshipType?: string;
  birthDate?: string;
  concern?: string;
  phase: "teaser" | "full";
}

export interface HistoryItem {
  id: string;
  type: "personal" | "compatibility";
  preview: HistoryPreview;
  createdAt: number;
  updatedAt: number;
}

export interface HistoryRecord extends HistoryItem {
  data: unknown;
}

interface HistoryModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (record: HistoryRecord) => void;
}

const REL_LABEL: Record<string, string> = {
  romantic: "연인",
  marriage: "결혼",
  friend: "친구",
  family: "가족",
  coworker: "직장",
};

function formatDate(ts: number): string {
  const d = new Date(ts);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd} ${hh}:${mi}`;
}

export function HistoryModal({ open, onClose, onSelect }: HistoryModalProps) {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    fetch("/api/history", { credentials: "include" })
      .then(async (r) => {
        if (!r.ok) throw new Error("기록을 불러오지 못했습니다.");
        return (await r.json()) as { items: HistoryItem[] };
      })
      .then((d) => setItems(d.items))
      .catch((e) => setError(e instanceof Error ? e.message : "오류"))
      .finally(() => setLoading(false));
  }, [open]);

  const handleSelect = async (id: string) => {
    setLoadingId(id);
    try {
      const r = await fetch(`/api/history?id=${encodeURIComponent(id)}`, { credentials: "include" });
      if (!r.ok) throw new Error("기록을 불러오지 못했습니다.");
      const record = (await r.json()) as HistoryRecord;
      onSelect(record);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("이 기록을 삭제하시겠어요?")) return;
    try {
      const r = await fetch(`/api/history?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!r.ok) throw new Error("삭제 실패");
      setItems((prev) => prev.filter((it) => it.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류");
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl max-h-[85vh] overflow-hidden rounded-2xl border border-white/10 bg-surface shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-lg font-semibold text-text-primary">
            내 분석 기록 <span className="text-text-secondary text-sm ml-1">({items.length}/10)</span>
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-text-secondary"
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {loading && <div className="p-4 text-center text-text-secondary text-sm">불러오는 중...</div>}
          {error && <div className="p-4 text-center text-red-400 text-sm">{error}</div>}
          {!loading && !error && items.length === 0 && (
            <div className="p-8 text-center text-text-secondary text-sm">
              아직 저장된 분석이 없어요.<br />분석을 진행하면 자동으로 저장됩니다.
            </div>
          )}
          {!loading &&
            items.map((it) => (
              <div
                key={it.id}
                onClick={() => handleSelect(it.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") handleSelect(it.id);
                }}
                className={`p-4 mb-2 rounded-xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.06] transition cursor-pointer ${
                  loadingId === it.id ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          it.type === "personal"
                            ? "bg-primary/20 text-primary-light"
                            : "bg-accent/20 text-accent"
                        }`}
                      >
                        {it.type === "personal" ? "개인" : "궁합"}
                      </span>
                      {it.preview.phase === "full" && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-text-secondary">
                          상세
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-text-primary font-medium truncate">
                      {it.type === "personal"
                        ? `${it.preview.name ?? "이름없음"} · ${it.preview.birthDate ?? ""}`
                        : `${it.preview.names?.[0] ?? "?"} × ${it.preview.names?.[1] ?? "?"}${
                            it.preview.relationshipType
                              ? ` · ${REL_LABEL[it.preview.relationshipType] ?? it.preview.relationshipType}`
                              : ""
                          }`}
                    </div>
                    {it.preview.concern && (
                      <div className="text-xs text-text-secondary mt-1 truncate">
                        "{it.preview.concern}"
                      </div>
                    )}
                    <div className="text-[11px] text-text-secondary/70 mt-1">
                      {formatDate(it.updatedAt)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(it.id, e)}
                    className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/20 text-text-secondary hover:text-red-400"
                    aria-label="삭제"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
